<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reminder extends Model
{
    protected $fillable = [
        'appointment_id',
        'type',
        'scheduled_for',
        'status',
        'sent_at',
        'message',
        'channel'
    ];

    protected $casts = [
        'scheduled_for' => 'datetime',
        'sent_at' => 'datetime'
    ];

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeDue($query)
    {
        return $query->where('status', 'pending')
                    ->where('scheduled_for', '<=', now());
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    // Métodos de utilidad
    public function markAsSent()
    {
        $this->update([
            'status' => 'sent',
            'sent_at' => now()
        ]);
    }

    public function markAsFailed()
    {
        $this->update(['status' => 'failed']);
    }
}