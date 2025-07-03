<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('promotions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('code')->unique(); // Código de descuento
            $table->enum('type', ['percentage', 'fixed']); // Porcentaje o monto fijo
            $table->decimal('value', 8, 2); // Valor del descuento
            $table->decimal('min_amount', 10, 2)->nullable(); // Monto mínimo para aplicar
            $table->decimal('max_discount', 10, 2)->nullable(); // Descuento máximo
            $table->integer('usage_limit')->nullable(); // Límite de usos
            $table->integer('used_count')->default(0); // Veces usado
            $table->boolean('is_active')->default(true);
            $table->timestamp('starts_at');
            $table->timestamp('expires_at');
            $table->json('applicable_days')->nullable(); // Días de la semana aplicables
            $table->json('applicable_services')->nullable(); // IDs de servicios aplicables
            $table->timestamps();
            
            // Índices
            $table->index(['code', 'is_active']);
            $table->index(['is_active', 'starts_at', 'expires_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promotions');
    }
};