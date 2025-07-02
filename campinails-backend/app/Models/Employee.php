<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Employee extends Model
{
    protected $fillable = [
        'name',
        'email',
        'phone',
        'is_active',
        'specialties',
        'notes'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'specialties' => 'array',
    ];

    // Relaciones
    public function services(): BelongsToMany
    {
        return $this->belongsToMany(Service::class, 'employee_service');
    }

    public function timeSlots(): HasMany
    {
        return $this->hasMany(TimeSlot::class);
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(EmployeeSchedule::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Métodos de utilidad
    public function isAvailableForService(Service $service): bool
    {
        return $this->services()->where('service_id', $service->id)->exists();
    }

    public function getAvailableServices()
    {
        return $this->services()->where('is_active', true)->get();
    }
}
