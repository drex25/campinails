<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('time_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->onDelete('cascade');
            $table->date('date'); // Fecha del slot (Y-m-d)
            $table->time('start_time'); // Hora de inicio (H:i)
            $table->time('end_time'); // Hora de fin (H:i)
            $table->enum('status', [
                'available',    // Disponible
                'reserved',     // Reservado
                'cancelled',    // Cancelado
                'blocked'       // Bloqueado por admin
            ])->default('available');
            $table->foreignId('appointment_id')->nullable()->constrained()->onDelete('set null');
            $table->text('notes')->nullable(); // Notas del admin
            $table->timestamps();
            
            // Índices para optimizar consultas
            $table->index(['service_id', 'date', 'status']);
            $table->index(['date', 'status']);
            
            // Evitar slots duplicados para el mismo servicio, fecha y hora
            $table->unique(['service_id', 'date', 'start_time'], 'unique_service_date_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('time_slots');
    }
};
