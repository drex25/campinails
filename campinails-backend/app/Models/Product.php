<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'name',
        'description',
        'sku',
        'category',
        'brand',
        'cost_price',
        'selling_price',
        'stock_quantity',
        'min_stock_level',
        'max_stock_level',
        'unit',
        'is_active',
        'notes'
    ];

    protected $casts = [
        'cost_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'is_active' => 'boolean'
    ];

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class)->orderBy('created_at', 'desc');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeLowStock($query)
    {
        return $query->whereColumn('stock_quantity', '<=', 'min_stock_level');
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    // Métodos de utilidad
    public function isLowStock(): bool
    {
        return $this->stock_quantity <= $this->min_stock_level;
    }

    public function isOutOfStock(): bool
    {
        return $this->stock_quantity <= 0;
    }

    public function addStock(int $quantity, string $reason = 'manual_adjustment', ?int $userId = null)
    {
        $this->increment('stock_quantity', $quantity);
        
        $this->stockMovements()->create([
            'type' => 'in',
            'quantity' => $quantity,
            'reason' => $reason,
            'user_id' => $userId,
            'notes' => "Stock añadido: {$reason}"
        ]);
    }

    public function removeStock(int $quantity, string $reason = 'manual_adjustment', ?int $userId = null)
    {
        $this->decrement('stock_quantity', $quantity);
        
        $this->stockMovements()->create([
            'type' => 'out',
            'quantity' => $quantity,
            'reason' => $reason,
            'user_id' => $userId,
            'notes' => "Stock removido: {$reason}"
        ]);
    }

    public function getFormattedCostPriceAttribute(): string
    {
        return '$' . number_format($this->cost_price, 0, ',', '.');
    }

    public function getFormattedSellingPriceAttribute(): string
    {
        return '$' . number_format($this->selling_price, 0, ',', '.');
    }
}