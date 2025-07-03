<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('sku')->unique(); // Código de producto
            $table->string('category'); // esmaltes, herramientas, accesorios, etc
            $table->string('brand')->nullable();
            $table->decimal('cost_price', 10, 2); // Precio de costo
            $table->decimal('selling_price', 10, 2)->nullable(); // Precio de venta (si se vende)
            $table->integer('stock_quantity')->default(0);
            $table->integer('min_stock_level')->default(0); // Nivel mínimo de stock
            $table->integer('max_stock_level')->nullable(); // Nivel máximo de stock
            $table->string('unit')->default('unidad'); // unidad, ml, gr, etc
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Índices
            $table->index(['category', 'is_active']);
            $table->index(['stock_quantity', 'min_stock_level']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};