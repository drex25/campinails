<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\TimeSlot;
use App\Models\Service;
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
            $createdCount = 0;

            for ($date = $startDate; $date->lte($endDate); $date->addDay()) {
                // Solo crear slots para los días de la semana especificados
                if (in_array($date->dayOfWeek, $daysOfWeek)) {
                    TimeSlot::createSlotsForService(
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
        $validated = $request->validate([
            'service_id' => 'required|exists:services,id',
            'date' => 'required|date|after_or_equal:today',
        ]);

        $slots = TimeSlot::with('service')
            ->forService($validated['service_id'])
            ->forDate($validated['date'])
            ->available()
            ->orderBy('start_time')
            ->get();

        return response()->json($slots);
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
}
