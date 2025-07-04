<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\TimeSlot;
use App\Models\Service;
use App\Models\Employee;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class TimeSlotController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = TimeSlot::with(['service', 'appointment.client']);

        // Filtros
        if ($request->has('service_id')) {
            $query->forService($request->service_id);
        }

        if ($request->has('date')) {
            $query->forDate($request->date);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('future') && $request->future) {
            $query->future();
        }

        return response()->json($query->orderBy('date')->orderBy('start_time')->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'service_id' => 'required|exists:services,id',
            'date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'status' => 'sometimes|in:available,blocked',
            'notes' => 'nullable|string',
        ]);

        // Verificar que no exista un slot duplicado
        $existingSlot = TimeSlot::where([
            'service_id' => $validated['service_id'],
            'date' => $validated['date'],
            'start_time' => $validated['start_time'],
        ])->first();

        if ($existingSlot) {
            return response()->json(['message' => 'Ya existe un slot para este servicio, fecha y hora'], 422);
        }

        $timeSlot = TimeSlot::create($validated);
        return response()->json($timeSlot->load('service'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $timeSlot = TimeSlot::with(['service', 'appointment.client'])->findOrFail($id);
        return response()->json($timeSlot);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $timeSlot = TimeSlot::findOrFail($id);
        
        $validated = $request->validate([
            'status' => 'sometimes|in:available,reserved,cancelled,blocked',
            'appointment_id' => 'nullable|exists:appointments,id',
            'notes' => 'nullable|string',
        ]);

        $timeSlot->update($validated);
        return response()->json($timeSlot->load('service'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $timeSlot = TimeSlot::findOrFail($id);
        $timeSlot->delete();
        return response()->json(['message' => 'Slot eliminado']);
    }

    /**
     * Crear slots automáticamente para un servicio en un rango de fechas
     */
    public function createBulk(Request $request)
    {
        try {
            $validated = $request->validate([
                'service_id' => 'required|exists:services,id',
                'start_date' => 'required|date',
                'end_date' => 'required|date|after_or_equal:start_date',
                'start_time' => 'required|date_format:H:i',
                'end_time' => 'required|date_format:H:i|after:start_time',
                'duration_minutes' => 'sometimes|integer|min:15|max:480', // 15 min a 8 horas
                'days_of_week' => 'sometimes|array|min:1|max:7', // 1=Lunes, 7=Domingo
            ]);

            $service = Service::findOrFail($validated['service_id']);
            $durationMinutes = $validated['duration_minutes'] ?? $service->duration_minutes;
            $daysOfWeek = $validated['days_of_week'] ?? [1, 2, 3, 4, 5, 6]; // Lunes a Sábado por defecto

            $startDate = Carbon::parse($validated['start_date']);
            $endDate = Carbon::parse($validated['end_date']);
            $processedDays = 0;
            $totalSlotsCreated = 0;

            for ($date = $startDate; $date->lte($endDate); $date->addDay()) {
                // Solo crear slots para los días de la semana especificados
                if (in_array($date->dayOfWeek, $daysOfWeek)) {
                    // Contar slots existentes antes de crear
                    $existingSlots = TimeSlot::where([
                        'service_id' => $validated['service_id'],
                        'date' => $date->format('Y-m-d'),
                    ])->count();
                    
                    TimeSlot::createSlotsForService(
                        $validated['service_id'],
                        $date->format('Y-m-d'),
                        $validated['start_time'],
                        $validated['end_time'],
                        $durationMinutes
                    );
                    
                    // Contar slots después de crear
                    $newSlots = TimeSlot::where([
                        'service_id' => $validated['service_id'],
                        'date' => $date->format('Y-m-d'),
                    ])->count();
                    
                    $totalSlotsCreated += ($newSlots - $existingSlots);
                    $processedDays++;
                }
            }

            return response()->json([
                'message' => "Procesados {$processedDays} días. Se crearon {$totalSlotsCreated} slots nuevos.",
                'processed_days' => $processedDays,
                'created_slots' => $totalSlotsCreated
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error en createBulk: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'error' => 'Error interno del servidor',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener slots disponibles para un servicio en una fecha específica
     */
    public function getAvailableSlots(Request $request)
    {
        Log::info('getAvailableSlots called', $request->all());
        
        $validated = $request->validate([
            'service_id' => 'required|exists:services,id',
            'date' => 'required|date|after_or_equal:today',
            'employee_id' => 'nullable|exists:employees,id',
        ]);

        Log::info('Validation passed', $validated);

        $query = TimeSlot::with(['service', 'employee'])
            ->forService($validated['service_id'])
            ->forDate($validated['date'])
            ->available();

        // Si se especifica un empleado, filtrar por él
        if (isset($validated['employee_id'])) {
            $query->where('employee_id', $validated['employee_id']);
        }

        $slots = $query->orderBy('start_time')->get();

        Log::info('Slots from database', ['count' => $slots->count()]);

        // Generar slots reales basados en horarios actuales de empleados
        Log::info('Generating real slots based on current employee schedules');
        $this->createSlotsFromSchedules(
            $validated['service_id'],
            $validated['date'],
            $validated['employee_id'] ?? null
        );
        
        // Obtener los slots reales de la base de datos
        $slots = $query->orderBy('start_time')->get();
        Log::info('Real slots retrieved', [
            'count' => $slots->count(),
            'slots' => $slots->map(function($slot) {
                return [
                    'id' => $slot->id,
                    'start_time' => $slot->start_time,
                    'end_time' => $slot->end_time,
                    'employee' => $slot->employee->name ?? 'N/A'
                ];
            })->toArray()
        ]);

        return response()->json($slots);
    }

    /**
     * Crear slots reales en la base de datos basados en horarios de empleados
     */
    private function createSlotsFromSchedules(int $serviceId, string $date, ?int $employeeId = null): void
    {
        $service = Service::findOrFail($serviceId);
        $dayOfWeek = Carbon::parse($date)->dayOfWeek;

        // Obtener empleados que ofrecen este servicio
        $employeesQuery = Employee::active()->whereHas('services', function ($q) use ($serviceId) {
            $q->where('service_id', $serviceId);
        });

        if ($employeeId) {
            $employeesQuery->where('id', $employeeId);
        }

        $employees = $employeesQuery->get();

        foreach ($employees as $employee) {
            Log::info('Processing employee for slot creation', ['employee_id' => $employee->id, 'name' => $employee->name]);
            
            // Obtener horarios del empleado para este día
            $schedules = $employee->schedules()
                ->active()
                ->forDay($dayOfWeek)
                ->get();

            Log::info('Employee schedules found for slot creation', [
                'employee_id' => $employee->id,
                'day_of_week' => $dayOfWeek,
                'schedules_count' => $schedules->count(),
                'schedules' => $schedules->map(fn($s) => [
                    'start_time' => $s->start_time->format('H:i'),
                    'end_time' => $s->end_time->format('H:i')
                ])->toArray()
            ]);

            foreach ($schedules as $schedule) {
                $generatedSlots = $schedule->generateSlotsForService($service, $date);
                
                Log::info('Generated slots for schedule creation', [
                    'schedule_id' => $schedule->id,
                    'schedule_time' => $schedule->start_time->format('H:i') . '-' . $schedule->end_time->format('H:i'),
                    'service_duration' => $service->duration_minutes,
                    'generated_slots' => $generatedSlots
                ]);
                
                foreach ($generatedSlots as $slotData) {
                    // Verificar si ya existe un slot para este empleado, servicio, fecha y hora
                    $existingSlot = TimeSlot::where([
                        'employee_id' => $employee->id,
                        'service_id' => $serviceId,
                        'date' => $date,
                        'start_time' => $slotData['start_time'],
                    ])->first();

                    // Verificar si hay una cita existente en este horario
                    $existingAppointment = \App\Models\Appointment::where('status', '!=', 'cancelled')
                        ->where('employee_id', $employee->id)
                        ->whereDate('scheduled_at', $date)
                        ->whereTime('scheduled_at', $slotData['start_time'])
                        ->exists();

                    if (!$existingSlot && !$existingAppointment) {
                        // Crear el slot real en la base de datos
                        TimeSlot::create([
                            'service_id' => $serviceId,
                            'employee_id' => $employee->id,
                            'date' => $date,
                            'start_time' => $slotData['start_time'],
                            'end_time' => $slotData['end_time'],
                            'status' => 'available'
                        ]);
                        
                        Log::info('Created real slot', [
                            'service_id' => $serviceId,
                            'employee_id' => $employee->id,
                            'date' => $date,
                            'start_time' => $slotData['start_time'],
                            'end_time' => $slotData['end_time']
                        ]);
                    }
                }
            }
        }
    }

    /**
     * Generar slots disponibles automáticamente basado en horarios de empleados
     */
    private function generateAvailableSlots(int $serviceId, string $date, ?int $employeeId = null): array
    {
        $service = Service::findOrFail($serviceId);
        $dayOfWeek = Carbon::parse($date)->dayOfWeek;
        $slots = [];

        // Obtener empleados que ofrecen este servicio
        $employeesQuery = Employee::active()->whereHas('services', function ($q) use ($serviceId) {
            $q->where('service_id', $serviceId);
        });

        if ($employeeId) {
            $employeesQuery->where('id', $employeeId);
        }

        $employees = $employeesQuery->get();

        foreach ($employees as $employee) {
            Log::info('Processing employee', ['employee_id' => $employee->id, 'name' => $employee->name]);
            
            // Obtener horarios del empleado para este día
            $schedules = $employee->schedules()
                ->active()
                ->forDay($dayOfWeek)
                ->get();

            Log::info('Employee schedules found', [
                'employee_id' => $employee->id,
                'day_of_week' => $dayOfWeek,
                'schedules_count' => $schedules->count(),
                'schedules' => $schedules->map(fn($s) => [
                    'start_time' => $s->start_time->format('H:i'),
                    'end_time' => $s->end_time->format('H:i')
                ])->toArray()
            ]);

            foreach ($schedules as $schedule) {
                $generatedSlots = $schedule->generateSlotsForService($service, $date);
                
                Log::info('Generated slots for schedule', [
                    'schedule_id' => $schedule->id,
                    'schedule_time' => $schedule->start_time->format('H:i') . '-' . $schedule->end_time->format('H:i'),
                    'service_duration' => $service->duration_minutes,
                    'generated_slots' => $generatedSlots
                ]);
                
                foreach ($generatedSlots as $slotData) {
                    // Verificar si ya existe un slot para este empleado, servicio, fecha y hora
                    $existingSlot = TimeSlot::where([
                        'employee_id' => $employee->id,
                        'service_id' => $serviceId,
                        'date' => $date,
                        'start_time' => $slotData['start_time'],
                    ])->first();

                    // Verificar si hay una cita existente en este horario
                    $existingAppointment = \App\Models\Appointment::where('status', '!=', 'cancelled')
                        ->where('employee_id', $employee->id)
                        ->whereDate('scheduled_at', $date)
                        ->whereTime('scheduled_at', $slotData['start_time'])
                        ->exists();

                    if (!$existingSlot && !$existingAppointment) {
                        $slots[] = [
                            'id' => null, // Slot virtual, no existe en BD
                            'service_id' => $serviceId,
                            'employee_id' => $employee->id,
                            'date' => $date,
                            'start_time' => $slotData['start_time'],
                            'end_time' => $slotData['end_time'],
                            'status' => 'available',
                            'service' => $service,
                            'employee' => $employee,
                            'is_virtual' => true // Marcar como slot virtual
                        ];
                    }
                }
            }
        }

        return $slots;
    }

    /**
     * Bloquear/desbloquear un slot
     */
    public function toggleBlock(Request $request, string $id)
    {
        $timeSlot = TimeSlot::findOrFail($id);
        
        if ($timeSlot->status === 'blocked') {
            $timeSlot->update(['status' => 'available']);
            $message = 'Slot desbloqueado';
        } else {
            $timeSlot->update(['status' => 'blocked']);
            $message = 'Slot bloqueado';
        }

        return response()->json(['message' => $message, 'slot' => $timeSlot->load('service')]);
    }

    /**
     * Devuelve los días con al menos un slot disponible para un servicio y rango de fechas
     */
    public function getAvailableDays(Request $request)
    {
        $validated = $request->validate([
            'service_id' => 'required|exists:services,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'employee_id' => 'nullable|exists:employees,id',
        ]);

        // Generar días disponibles basados en horarios actuales de empleados
        $service = Service::findOrFail($validated['service_id']);
        $startDate = Carbon::parse($validated['start_date']);
        $endDate = Carbon::parse($validated['end_date']);
        $availableDays = [];

        // Obtener empleados que ofrecen este servicio
        $employeesQuery = Employee::active()->whereHas('services', function ($q) use ($validated) {
            $q->where('service_id', $validated['service_id']);
        });

        if (isset($validated['employee_id'])) {
            $employeesQuery->where('id', $validated['employee_id']);
        }

        $employees = $employeesQuery->get();

        for ($date = $startDate; $date->lte($endDate); $date->addDay()) {
            $dayOfWeek = $date->dayOfWeek;
            
            foreach ($employees as $employee) {
                // Verificar si el empleado tiene horario para este día
                $hasSchedule = $employee->schedules()
                    ->active()
                    ->forDay($dayOfWeek)
                    ->exists();
                
                if ($hasSchedule) {
                    $availableDays[] = $date->format('Y-m-d');
                    break; // Si al menos un empleado tiene horario, el día está disponible
                }
            }
        }

        return response()->json(array_unique($availableDays));
    }
}
