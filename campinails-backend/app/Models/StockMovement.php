<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockMovement extends Model
{
    protected $fillable = [
        'product_id',
        'type',
        'quantity',
        'reason',
        'user_id',
        'notes'
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeIn($query)
    {
        return $query->where('type', 'in');
    }

    public function scopeOut($query)
    {
        return $query->where('type', 'out');
    }

    public function scopeByReason($query, $reason)
    {
        return $query->where('reason', $reason);
    }
}