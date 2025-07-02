<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Appointment;
use App\Models\Service;
use App\Models\Client;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class AppointmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Appointment::with(['service', 'client']);
        if ($request->has('date')) {
            $query->whereDate('scheduled_at', $request->date);
        }
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('client_id')) {
            $query->where('client_id', $request->client_id);
        }
        return response()->json($query->orderBy('scheduled_at')->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
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

        $start = Carbon::createFromFormat('Y-m-d H:i', $validated['scheduled_at']);
        $end = (clone $start)->addMinutes($service->duration_minutes);

        // Si se especifica un empleado, validar que pueda realizar el servicio
        if (isset($validated['employee_id'])) {
            $employee = \App\Models\Employee::findOrFail($validated['employee_id']);
            if (!$employee->isAvailableForService($service)) {
                return response()->json(['message' => 'El empleado seleccionado no ofrece este servicio'], 422);
            }
            
            // Validar que el empleado esté disponible en ese horario
            $dayOfWeek = $start->dayOfWeek;
            $timeStr = $start->format('H:i');
            
            $availableSchedule = $employee->schedules()
                ->active()
                ->forDay($dayOfWeek)
                ->where('start_time', '<=', $timeStr)
                ->where('end_time', '>=', $end->format('H:i'))
                ->first();
                
            if (!$availableSchedule) {
                return response()->json(['message' => 'El empleado no está disponible en ese horario'], 422);
            }
            
            // Validar que no haya otro turno con el mismo empleado en ese horario
            $overlap = Appointment::where('status', '!=', 'cancelled')
                ->where('employee_id', $validated['employee_id'])
                ->where(function($q) use ($start, $end) {
                    $q->whereBetween('scheduled_at', [$start, $end->subMinute()])
                      ->orWhereBetween('ends_at', [$start->addMinute(), $end]);
                })->exists();
        } else {
            // Validar solapamiento general de turnos
            $overlap = Appointment::where('status', '!=', 'cancelled')
                ->where(function($q) use ($start, $end) {
                    $q->whereBetween('scheduled_at', [$start, $end->subMinute()])
                      ->orWhereBetween('ends_at', [$start->addMinute(), $end]);
                })->exists();
        }
        
        if ($overlap) {
            return response()->json(['message' => 'Ya existe un turno en ese horario'], 422);
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
        return response()->json($appointment->load(['service', 'client']), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $appointment = Appointment::with(['service', 'client'])->findOrFail($id);
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
            'deposit_paid_at' => 'nullable|date',
            'special_requests' => 'nullable|string',
            'reference_photo' => 'nullable|string',
        ]);
        // Reprogramación
        if (isset($validated['scheduled_at'])) {
            if ($appointment->reschedule_count >= 2) {
                return response()->json(['message' => 'Solo se puede reprogramar dos veces'], 422);
            }
            $service = $appointment->service;
            $start = Carbon::createFromFormat('Y-m-d H:i', $validated['scheduled_at']);
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
        $appointment->save();
        return response()->json($appointment->load(['service', 'client']));
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
