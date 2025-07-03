<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Carbon\Carbon;

class Promotion extends Model
{
    protected $fillable = [
        'name',
        'description',
        'code',
        'type',
        'value',
        'min_amount',
        'max_discount',
        'usage_limit',
        'used_count',
        'is_active',
        'starts_at',
        'expires_at',
        'applicable_days',
        'applicable_services'
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'min_amount' => 'decimal:2',
        'max_discount' => 'decimal:2',
        'is_active' => 'boolean',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
        'applicable_days' => 'array',
        'applicable_services' => 'array'
    ];

    public function services(): BelongsToMany
    {
        return $this->belongsToMany(Service::class, 'promotion_service');
    }

    public function appointments(): BelongsToMany
    {
        return $this->belongsToMany(Appointment::class, 'appointment_promotion');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
                    ->where('starts_at', '<=', now())
                    ->where('expires_at', '>=', now());
    }

    public function scopeByCode($query, $code)
    {
        return $query->where('code', $code);
    }

    // Métodos de utilidad
    public function isValid(): bool
    {
        return $this->is_active &&
               $this->starts_at <= now() &&
               $this->expires_at >= now() &&
               ($this->usage_limit === null || $this->used_count < $this->usage_limit);
    }

    public function canBeAppliedTo(Service $service, Carbon $date): bool
    {
        if (!$this->isValid()) {
            return false;
        }

        // Verificar servicios aplicables
        if (!empty($this->applicable_services) && !in_array($service->id, $this->applicable_services)) {
            return false;
        }

        // Verificar días aplicables
        if (!empty($this->applicable_days) && !in_array($date->dayOfWeek, $this->applicable_days)) {
            return false;
        }

        return true;
    }

    public function calculateDiscount(float $amount): float
    {
        if ($this->min_amount && $amount < $this->min_amount) {
            return 0;
        }

        $discount = 0;

        if ($this->type === 'percentage') {
            $discount = $amount * ($this->value / 100);
        } elseif ($this->type === 'fixed') {
            $discount = $this->value;
        }

        if ($this->max_discount && $discount > $this->max_discount) {
            $discount = $this->max_discount;
        }

        return min($discount, $amount);
    }

    public function incrementUsage()
    {
        $this->increment('used_count');
    }
}