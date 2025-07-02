<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Employee;
use App\Models\Service;
use App\Models\TimeSlot;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class EmployeeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Employee::with(['services']);

        if ($request->has('active')) {
            $query->where('is_active', $request->boolean('active'));
        }

        if ($request->has('service_id')) {
            $query->whereHas('services', function ($q) use ($request) {
                $q->where('service_id', $request->service_id);
            });
        }

        return response()->json($query->orderBy('name')->get());
    }

    /**
     * Display a public listing of employees for a specific service.
     */
    public function publicIndex(Request $request)
    {
        $validated = $request->validate([
            'service_id' => 'required|exists:services,id',
            'active' => 'nullable|string|in:true,false,1,0'
        ]);

        $isActive = true; // default
        if (isset($validated['active'])) {
            $isActive = in_array($validated['active'], ['true', '1']);
        }

        $query = Employee::with(['services'])
            ->where('is_active', $isActive)
            ->whereHas('services', function ($q) use ($validated) {
                $q->where('service_id', $validated['service_id']);
            });

        return response()->json($query->orderBy('name')->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:employees,email',
            'phone' => 'nullable|string|max:20',
            'is_active' => 'boolean',
            'specialties' => 'nullable|array',
            'notes' => 'nullable|string',
            'service_ids' => 'nullable|array',
            'service_ids.*' => 'exists:services,id'
        ]);

        $employee = Employee::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'specialties' => $validated['specialties'] ?? [],
            'notes' => $validated['notes'] ?? null,
        ]);

        if (isset($validated['service_ids'])) {
            $employee->services()->attach($validated['service_ids']);
        }

        return response()->json($employee->load('services'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $employee = Employee::with(['services', 'timeSlots.service'])->findOrFail($id);
        return response()->json($employee);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $employee = Employee::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:employees,email,' . $id,
            'phone' => 'nullable|string|max:20',
            'is_active' => 'sometimes|boolean',
            'specialties' => 'nullable|array',
            'notes' => 'nullable|string',
            'service_ids' => 'nullable|array',
            'service_ids.*' => 'exists:services,id'
        ]);

        $employee->update($validated);

        if (isset($validated['service_ids'])) {
            $employee->services()->sync($validated['service_ids']);
        }

        return response()->json($employee->load('services'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $employee = Employee::findOrFail($id);
        $employee->delete();
        return response()->json(['message' => 'Empleado eliminado']);
    }

    /**
     * Obtener el horario de un empleado
     */
    public function getSchedule(Request $request, string $id)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'service_id' => 'nullable|exists:services,id'
        ]);

        $employee = Employee::findOrFail($id);
        
        $query = $employee->timeSlots()
            ->with(['service', 'appointment.client'])
            ->whereBetween('date', [$validated['start_date'], $validated['end_date']])
            ->orderBy('date')
            ->orderBy('start_time');

        if (isset($validated['service_id'])) {
            $query->where('service_id', $validated['service_id']);
        }

        $schedule = $query->get();

        return response()->json([
            'employee' => $employee->load('services'),
            'schedule' => $schedule
        ]);
    }

    /**
     * Crear slots para un empleado específico
     */
    public function createSlots(Request $request, string $id)
    {
        $validated = $request->validate([
            'service_id' => 'required|exists:services,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'duration_minutes' => 'sometimes|integer|min:15|max:480',
            'days_of_week' => 'sometimes|array|min:1|max:7',
        ]);

        $employee = Employee::findOrFail($id);
        
        // Verificar que el empleado pueda realizar este servicio
        if (!$employee->isAvailableForService(Service::find($validated['service_id']))) {
            return response()->json([
                'error' => 'El empleado no está asignado a este servicio'
            ], 422);
        }

        $service = Service::findOrFail($validated['service_id']);
        $durationMinutes = $validated['duration_minutes'] ?? $service->duration_minutes;
        $daysOfWeek = $validated['days_of_week'] ?? [1, 2, 3, 4, 5, 6];

        $startDate = Carbon::parse($validated['start_date']);
        $endDate = Carbon::parse($validated['end_date']);
        $createdCount = 0;

        for ($date = $startDate; $date->lte($endDate); $date->addDay()) {
            if (in_array($date->dayOfWeek, $daysOfWeek)) {
                $this->createSlotsForEmployee(
                    $employee->id,
                    $validated['service_id'],
                    $date->format('Y-m-d'),
                    $validated['start_time'],
                    $validated['end_time'],
                    $durationMinutes
                );
                $createdCount++;
            }
        }

        return response()->json([
            'message' => "Se crearon slots para {$createdCount} días",
            'created_count' => $createdCount
        ], 201);
    }

    /**
     * Método privado para crear slots para un empleado específico
     */
    private function createSlotsForEmployee(
        int $employeeId,
        int $serviceId,
        string $date,
        string $startTime,
        string $endTime,
        int $durationMinutes
    ): void {
        $start = Carbon::createFromFormat('H:i', $startTime);
        $end = Carbon::createFromFormat('H:i', $endTime);
        
        while ($start->lt($end)) {
            $slotEnd = (clone $start)->addMinutes($durationMinutes);
            
            if ($slotEnd->lte($end)) {
                // Verificar si ya existe un slot para esta combinación
                $existingSlot = TimeSlot::where([
                    'employee_id' => $employeeId,
                    'service_id' => $serviceId,
                    'date' => $date,
                    'start_time' => $start->format('H:i'),
                ])->first();
                
                // Solo crear si no existe
                if (!$existingSlot) {
                    TimeSlot::create([
                        'employee_id' => $employeeId,
                        'service_id' => $serviceId,
                        'date' => $date,
                        'start_time' => $start->format('H:i'),
                        'end_time' => $slotEnd->format('H:i'),
                        'status' => 'available'
                    ]);
                }
            }
            
            $start->addMinutes($durationMinutes);
        }
    }
}
