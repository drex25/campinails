<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointment_promotion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appointment_id')->constrained()->onDelete('cascade');
            $table->foreignId('promotion_id')->constrained()->onDelete('cascade');
            $table->decimal('discount_amount', 10, 2);
            $table->timestamps();
            
            // Evitar duplicados
            $table->unique(['appointment_id', 'promotion_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointment_promotion');
    }
};