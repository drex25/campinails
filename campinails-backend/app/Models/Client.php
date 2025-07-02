<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Client extends Model
{
    protected $fillable = [
        'name',
        'whatsapp',
        'email',
        'notes',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function getFormattedWhatsappAttribute(): string
    {
        // Formatear WhatsApp para mostrar +54 9 11 1234-5678
        $whatsapp = preg_replace('/[^0-9]/', '', $this->whatsapp);
        
        if (strlen($whatsapp) === 10) {
            return '+54 9 ' . substr($whatsapp, 0, 2) . ' ' . substr($whatsapp, 2, 4) . '-' . substr($whatsapp, 6);
        }
        
        return $this->whatsapp;
    }
}
