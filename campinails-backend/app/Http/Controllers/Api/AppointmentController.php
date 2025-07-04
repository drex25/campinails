<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Appointment;
use App\Models\Service;
use App\Models\Client;
use App\Models\TimeSlot;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class AppointmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Appointment::with(['service', 'client', 'employee']);
        
        if ($request->has('date')) {
            // Si date contiene una coma, es un rango de fechas
            if (strpos($request->date, ',') !== false) {
                list($startDate, $endDate) = explode(',', $request->date);
                $query->whereBetween(DB::raw('DATE(scheduled_at)'), [$startDate, $endDate]);
            } else {
                $query->whereDate('scheduled_at', $request->date);
            }
        }
        
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->has('client_id')) {
            $query->where('client_id', $request->client_id);
        }
        
        if ($request->has('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }
        
        if ($request->has('service_id')) {
            $query->where('service_id', $request->service_id);
        }
        
        return response()->json($query->orderBy('scheduled_at')->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        Log::info('Appointment store called', [
            'request_data' => $request->all(),
            'timezone' => config('app.timezone')
        ]);
        
        $validated = $request->validate([
            'service_id' => 'required|exists:services,id',
            'scheduled_at' => 'required|date_format:Y-m-d H:i',
            'employee_id' => 'nullable|exists:employees,id',
            'special_requests' => 'nullable|string',
            'reference_photo' => 'nullable|string',
            // Datos del cliente para creación automática
            'name' => 'required|string|max:255',
            'whatsapp' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
        ]);

        $service = Service::findOrFail($validated['service_id']);
        
        // Crear o encontrar el cliente
        $client = Client::firstOrCreate(
            ['whatsapp' => $validated['whatsapp']],
            [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'is_active' => true,
            ]
        );

        // Usar la hora exacta proporcionada sin redondear
        $start = Carbon::createFromFormat('Y-m-d H:i', $validated['scheduled_at']);
        $start->setSecond(0); // Solo asegurar que los segundos sean 0
        
        $end = (clone $start)->addMinutes($service->duration_minutes);
        
        Log::info('Fecha procesada', [
            'original_scheduled_at' => $validated['scheduled_at'],
            'start_parsed' => $start->format('Y-m-d H:i:s'),
            'start_timezone' => $start->timezone->getName(),
            'end_parsed' => $end->format('Y-m-d H:i:s'),
            'service_duration' => $service->duration_minutes
        ]);
        
        // Verificar que existe un slot disponible para este horario
        $availableSlot = \App\Models\TimeSlot::where([
            'service_id' => $service->id,
            'employee_id' => $validated['employee_id'] ?? null,
            'date' => $start->format('Y-m-d'),
            'start_time' => $start->format('H:i'),
            'status' => 'available'
        ])->first();
        
        if (!$availableSlot) {
            return response()->json([
                'message' => 'El horario seleccionado no está disponible. Por favor, selecciona otro horario.'
            ], 422);
        }

        // Si se especifica un empleado, validar que pueda realizar el servicio
        if (isset($validated['employee_id'])) {
            $employee = \App\Models\Employee::findOrFail($validated['employee_id']);
            if (!$employee->isAvailableForService($service)) {
                return response()->json(['message' => 'El empleado seleccionado no ofrece este servicio'], 422);
            }
        }
        
        // Validar anticipación mínima 24hs
        if ($start->lt(now()->addDay())) {
            return response()->json(['message' => 'Las reservas deben realizarse con al menos 24hs de anticipación'], 422);
        }
        // Calcular precios y seña
        $total_price = $service->price;
        $deposit_amount = $service->requires_deposit ? round($total_price * ($service->deposit_percentage / 100)) : 0;

        $appointment = Appointment::create([
            'service_id' => $service->id,
            'client_id' => $client->id,
            'employee_id' => $validated['employee_id'] ?? null,
            'scheduled_at' => $start,
            'ends_at' => $end,
            'status' => 'pending_deposit',
            'total_price' => $total_price,
            'deposit_amount' => $deposit_amount,
            'deposit_paid' => false,
            'reschedule_count' => 0,
            'special_requests' => $validated['special_requests'] ?? null,
            'reference_photo' => $validated['reference_photo'] ?? null,
        ]);
        
        // Reservar el slot
        $availableSlot->update([
            'status' => 'reserved',
            'appointment_id' => $appointment->id
        ]);
        
        // Si requiere seña, procesar el pago automáticamente
        if ($deposit_amount > 0) {
            try {
                $paymentService = app(\App\Services\PaymentService::class);
                
                $payment = \App\Models\Payment::create([
                    'appointment_id' => $appointment->id,
                    'amount' => $deposit_amount,
                    'payment_method' => 'pending',
                    'payment_provider' => 'pending',
                    'metadata' => [
                        'service_name' => $service->name,
                        'client_name' => $client->name
                    ],
                    'status' => 'pending'
                ]);
                
                $result = $paymentService->processPayment($payment);
                
                if ($result['success']) {
                    $payment->update([
                        'provider_payment_id' => $result['payment_id'],
                        'status' => 'processing'
                    ]);
                    
                    return response()->json([
                        'appointment' => $appointment->load(['service', 'client', 'employee']),
                        'payment_url' => $result['init_point'] ?? $result['sandbox_init_point'] ?? $result['checkout_url'],
                        'payment_id' => $result['payment_id'],
                        'requires_payment' => true
                    ], 201);
                } else {
                    // Si falla el pago, eliminar el turno
                    $appointment->delete();
                    $availableSlot->update(['status' => 'available', 'appointment_id' => null]);
                    
                    return response()->json([
                        'message' => 'Error al procesar el pago: ' . $result['error']
                    ], 422);
                }
            } catch (\Exception $e) {
                Log::error('Error processing payment for appointment: ' . $e->getMessage());
                
                // Si falla el pago, eliminar el turno
                $appointment->delete();
                $availableSlot->update(['status' => 'available', 'appointment_id' => null]);
                
                return response()->json([
                    'message' => 'Error al procesar el pago. Por favor, intenta nuevamente.'
                ], 422);
            }
        }
        
        // Si no requiere seña o si ocurrió algún error, devolver solo el turno
        return response()->json($appointment->load(['service', 'client', 'employee']), 201);
    }

    /**
     * Process payment for an appointment
     */
    public function processPayment(Request $request, string $id)
    {
        $appointment = Appointment::findOrFail($id);
        
        if ($appointment->deposit_paid) {
            return response()->json([
                'message' => 'Este turno ya tiene la seña pagada'
            ], 422);
        }
        
        $validated = $request->validate([
            'payment_method' => 'required|in:mercadopago,stripe,transfer,cash',
        ]);
        
        try {
            $paymentService = app(\App\Services\PaymentService::class);
            
            $payment = \App\Models\Payment::create([
                'appointment_id' => $appointment->id,
                'amount' => $appointment->deposit_amount,
                'payment_method' => $validated['payment_method'],
                'payment_provider' => $validated['payment_method'] === 'transfer' || $validated['payment_method'] === 'cash' ? 'manual' : $validated['payment_method'],
                'metadata' => [
                    'service_name' => $appointment->service->name,
                    'client_name' => $appointment->client->name
                ],
                'status' => 'pending'
            ]);
            
            if (in_array($validated['payment_method'], ['mercadopago', 'stripe'])) {
                $result = $paymentService->processPayment($payment);
                
                if ($result['success']) {
                    $payment->update([
                        'provider_payment_id' => $result['payment_id'],
                        'status' => 'processing'
                    ]);
                    
                    return response()->json([
                        'appointment' => $appointment->load(['service', 'client', 'employee']),
                        'payment_url' => $result['init_point'] ?? $result['sandbox_init_point'] ?? $result['checkout_url'],
                        'payment_id' => $result['payment_id'],
                        'requires_payment' => true
                    ], 201);
                } else {
                    // Si falla el pago, eliminar el turno
                    $appointment->delete();
                    $availableSlot->update(['status' => 'available', 'appointment_id' => null]);
                    
                    return response()->json([
                        'message' => 'Error al procesar el pago: ' . $result['error']
                    ], 422);
                }
            } catch (\Exception $e) {
                Log::error('Error processing payment: ' . $e->getMessage());
                
                // Si falla el pago, eliminar el pago pero mantener el turno
                $payment->delete();
                
                return response()->json([
                    'message' => 'Error al procesar el pago. Por favor, intenta nuevamente.'
                ], 422);
            }
        } else if ($validated['payment_method'] === 'transfer') {
            // Para transferencia, marcar como pendiente
            $payment->update([
                'status' => 'processing',
                'payment_provider' => 'manual'
            ]);
            
            // El turno permanece como pending_deposit hasta que se confirme el pago
            $appointment->update([
                'admin_notes' => 'Pago por transferencia pendiente de confirmación.'
            ]);
            
            return response()->json([
                'message' => 'Pago por transferencia registrado. Pendiente de confirmación.',
                'appointment' => $appointment->load(['service', 'client', 'employee']),
            ], 201);
        } else if ($validated['payment_method'] === 'cash') {
            // Para efectivo, marcar como pendiente
            $payment->update([
                'status' => 'processing',
                'payment_provider' => 'manual'
            ]);
            
            // El turno permanece como pending_deposit hasta que se confirme el pago en el local
            $appointment->update([
                'admin_notes' => 'Cliente pagará en efectivo al llegar al local.'
            ]);
            
            return response()->json([
                'message' => 'Pago en efectivo registrado. Se confirmará al llegar al local.',
                'appointment' => $appointment->load(['service', 'client', 'employee']),
            ], 201);
        }
        
        return response()->json([
            'message' => 'Método de pago no soportado'
        ], 422);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $appointment = Appointment::with(['service', 'client', 'employee'])->findOrFail($id);
        return response()->json($appointment);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $appointment = Appointment::findOrFail($id);
        
        $validated = $request->validate([
            'scheduled_at' => 'nullable|date_format:Y-m-d H:i',
            'status' => ['nullable', Rule::in(['pending_deposit','confirmed','rescheduled','cancelled','no_show','completed'])],
            'deposit_paid' => 'nullable|boolean',
            'deposit_paid_at' => 'nullable',
            'special_requests' => 'nullable|string',
            'reference_photo' => 'nullable|string',
            'admin_notes' => 'nullable|string',
        ]);
        
        // Reprogramación
        if (isset($validated['scheduled_at'])) {
            if ($appointment->reschedule_count >= 2) {
                return response()->json(['message' => 'Solo se puede reprogramar dos veces'], 422);
            }
            $service = $appointment->service;
            
            // Asegurarse de que la hora esté en formato correcto (HH:MM:00)
            $start = Carbon::createFromFormat('Y-m-d H:i', $validated['scheduled_at']);
            // Redondear a intervalos de 30 minutos
            $minutes = $start->minute;
            $roundedMinutes = $minutes - ($minutes % 30);
            $start->setMinute($roundedMinutes)->setSecond(0);
            
            $end = (clone $start)->addMinutes($service->duration_minutes);
            
            if ($start->isSunday() || $start->hour < 9 || $end->hour > 18 || ($end->hour === 18 && $end->minute > 0)) {
                return response()->json(['message' => 'El turno debe ser de lunes a sábado entre 9:00 y 18:00'], 422);
            }
            if ($start->lt(now()->addDay())) {
                return response()->json(['message' => 'Las reservas deben realizarse con al menos 24hs de anticipación'], 422);
            }
            $overlap = Appointment::where('id', '!=', $appointment->id)
                ->where('status', '!=', 'cancelled')
                ->where(function($q) use ($start, $end) {
                    $q->whereBetween('scheduled_at', [$start, $end->subMinute()])
                      ->orWhereBetween('ends_at', [$start->addMinute(), $end]);
                })->exists();
            if ($overlap) {
                return response()->json(['message' => 'Ya existe un turno en ese horario'], 422);
            }
            $appointment->scheduled_at = $start;
            $appointment->ends_at = $end;
            $appointment->reschedule_count += 1;
            $appointment->status = 'rescheduled';
        }
        // Cambiar estado
        if (isset($validated['status'])) {
            $appointment->status = $validated['status'];
        }
        // Cargar seña
        if (isset($validated['deposit_paid'])) {
            $appointment->deposit_paid = $validated['deposit_paid'];
            $appointment->deposit_paid_at = $validated['deposit_paid'] ? now() : null;
            if ($validated['deposit_paid']) {
                $appointment->status = 'confirmed';
            }
        }
        // Otros campos
        if (isset($validated['special_requests'])) {
            $appointment->special_requests = $validated['special_requests'];
        }
        if (isset($validated['reference_photo'])) {
            $appointment->reference_photo = $validated['reference_photo'];
        }
        
        // Notas del admin
        if (isset($validated['admin_notes'])) {
            $appointment->admin_notes = $validated['admin_notes'];
        }
        
        $appointment->save();
        
        // Si se confirma el turno, enviar notificación al cliente
        if (isset($validated['status']) && $validated['status'] === 'confirmed' && $appointment->status !== 'confirmed') {
            try {
                $notificationService = app(\App\Services\NotificationService::class);
                $notificationService->sendAppointmentConfirmation($appointment);
            } catch (\Exception $e) {
                \Log::error('Error enviando notificación de confirmación: ' . $e->getMessage());
            }
        }
        
        // Si se cancela el turno, enviar notificación al cliente
        if (isset($validated['status']) && $validated['status'] === 'cancelled' && $appointment->status !== 'cancelled') {
            try {
                $notificationService = app(\App\Services\NotificationService::class);
                $notificationService->sendAppointmentCancellation($appointment);
            } catch (\Exception $e) {
                \Log::error('Error enviando notificación de cancelación: ' . $e->getMessage());
            }
        }
        
        return response()->json($appointment->load(['service', 'client', 'employee']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $appointment = Appointment::findOrFail($id);
        $appointment->delete();
        return response()->json(['message' => 'Turno eliminado']);
    }
}