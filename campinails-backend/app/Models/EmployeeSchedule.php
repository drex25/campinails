<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class EmployeeSchedule extends Model
{
    protected $fillable = [
        'employee_id',
        'day_of_week',
        'start_time',
        'end_time',
        'is_active',
        'notes'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
    ];

    // Relaciones
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForDay($query, $dayOfWeek)
    {
        return $query->where('day_of_week', $dayOfWeek);
    }

    public function scopeForEmployee($query, $employeeId)
    {
        return $query->where('employee_id', $employeeId);
    }

    // Métodos de utilidad
    public function getDayNameAttribute(): string
    {
        return match($this->day_of_week) {
            1 => 'Lunes',
            2 => 'Martes',
            3 => 'Miércoles',
            4 => 'Jueves',
            5 => 'Viernes',
            6 => 'Sábado',
            7 => 'Domingo',
            default => 'Desconocido'
        };
    }

    public function getFormattedTimeRangeAttribute(): string
    {
        return $this->start_time->format('H:i') . ' - ' . $this->end_time->format('H:i');
    }

    public function getDurationMinutesAttribute(): int
    {
        return $this->start_time->diffInMinutes($this->end_time);
    }

    // Verificar si un horario específico está dentro de este rango
    public function isTimeInRange(string $time): bool
    {
        $checkTime = Carbon::createFromFormat('H:i', $time);
        return $checkTime->between($this->start_time, $this->end_time);
    }

    // Generar slots de tiempo para un servicio específico
    public function generateSlotsForService(Service $service, string $date): array
    {
        $slots = [];
        $currentTime = clone $this->start_time;
        $end = clone $this->end_time;
        $durationMinutes = $service->duration_minutes;

        while ($currentTime->addMinutes($durationMinutes)->lte($end)) {
            $slotStart = (clone $currentTime)->subMinutes($durationMinutes);
            $slotEnd = clone $currentTime;
            
            $slots[] = [
                'date' => $date,
                'start_time' => $slotStart->format('H:i'),
                'end_time' => $slotEnd->format('H:i'),
                'duration_minutes' => $durationMinutes
            ];
        }

        return $slots;
    }
}
