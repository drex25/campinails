<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class Appointment extends Model
{
    protected $fillable = [
        'service_id',
        'client_id',
        'employee_id',
        'scheduled_at',
        'ends_at',
        'status',
        'total_price',
        'deposit_amount',
        'deposit_paid',
        'deposit_paid_at',
        'reschedule_count',
        'special_requests',
        'reference_photo',
        'admin_notes'
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'ends_at' => 'datetime',
        'deposit_paid_at' => 'datetime',
        'deposit_paid' => 'boolean',
        'total_price' => 'decimal:2',
        'deposit_amount' => 'decimal:2'
    ];

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function getFormattedScheduledAtAttribute(): string
    {
        return $this->scheduled_at->format('d/m/Y H:i');
    }

    public function getFormattedTotalPriceAttribute(): string
    {
        return '$' . number_format($this->total_price, 0, ',', '.');
    }

    public function getFormattedDepositAmountAttribute(): string
    {
        return '$' . number_format($this->deposit_amount, 0, ',', '.');
    }

    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'pending_deposit' => 'yellow',
            'confirmed' => 'green',
            'rescheduled' => 'blue',
            'cancelled' => 'red',
            'no_show' => 'gray',
            'completed' => 'purple',
            default => 'gray'
        };
    }

    public function getStatusTextAttribute(): string
    {
        return match($this->status) {
            'pending_deposit' => 'Pendiente de Seña',
            'confirmed' => 'Confirmado',
            'rescheduled' => 'Reprogramado',
            'cancelled' => 'Cancelado',
            'no_show' => 'No Presentado',
            'completed' => 'Completado',
            default => 'Desconocido'
        };
    }

    public function canBeRescheduled(): bool
    {
        return $this->reschedule_count < 2;
    }

    public function isOverdue(): bool
    {
        return $this->scheduled_at->addMinutes(10)->isPast() && $this->status === 'confirmed';
    }
}
