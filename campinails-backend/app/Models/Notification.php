<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    protected $fillable = [
        'type',
        'recipient_type',
        'recipient_id',
        'title',
        'message',
        'data',
        'status',
        'sent_at',
        'read_at',
        'scheduled_for'
    ];

    protected $casts = [
        'data' => 'array',
        'sent_at' => 'datetime',
        'read_at' => 'datetime',
        'scheduled_for' => 'datetime'
    ];

    // Relaciones polimórficas
    public function recipient()
    {
        return $this->morphTo();
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeSent($query)
    {
        return $query->where('status', 'sent');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function scopeScheduled($query)
    {
        return $query->whereNotNull('scheduled_for')
                    ->where('scheduled_for', '<=', now())
                    ->where('status', 'pending');
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

    public function markAsRead()
    {
        $this->update(['read_at' => now()]);
    }
}