<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class TimeSlot extends Model
{
    protected $fillable = [
        'service_id',
        'date',
        'start_time',
        'end_time',
        'status',
        'appointment_id',
        'notes'
    ];

    protected $casts = [
        'date' => 'date',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
    ];

    // Relaciones
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    // Scopes para consultas comunes
    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    public function scopeForDate($query, $date)
    {
        return $query->where('date', $date);
    }

    public function scopeForService($query, $serviceId)
    {
        return $query->where('service_id', $serviceId);
    }

    public function scopeFuture($query)
    {
        return $query->where('date', '>=', now()->toDateString());
    }

    // Métodos de utilidad
    public function isAvailable(): bool
    {
        return $this->status === 'available';
    }

    public function isReserved(): bool
    {
        return $this->status === 'reserved';
    }

    public function isBlocked(): bool
    {
        return $this->status === 'blocked';
    }

    public function getFullDateTimeAttribute(): string
    {
        return $this->date->format('Y-m-d') . ' ' . $this->start_time->format('H:i');
    }

    public function getDurationMinutesAttribute(): int
    {
        return $this->start_time->diffInMinutes($this->end_time);
    }

    // Método para crear slots automáticamente
    public static function createSlotsForService(
        int $serviceId, 
        string $date, 
        string $startTime, 
        string $endTime, 
        int $durationMinutes = 30
    ): void {
        $start = Carbon::createFromFormat('H:i', $startTime);
        $end = Carbon::createFromFormat('H:i', $endTime);
        
        while ($start->lt($end)) {
            $slotEnd = (clone $start)->addMinutes($durationMinutes);
            
            if ($slotEnd->lte($end)) {
                self::create([
                    'service_id' => $serviceId,
                    'date' => $date,
                    'start_time' => $start->format('H:i'),
                    'end_time' => $slotEnd->format('H:i'),
                    'status' => 'available'
                ]);
            }
            
            $start->addMinutes($durationMinutes);
        }
    }
}
