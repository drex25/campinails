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
        Schema::create('employee_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->tinyInteger('day_of_week'); // 1=Lunes, 7=Domingo
            $table->time('start_time');
            $table->time('end_time');
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable(); // Para bloqueos o descansos
            $table->timestamps();
            
            // Índices
            $table->index(['employee_id', 'day_of_week', 'is_active']);
            
            // Evitar horarios duplicados para el mismo empleado y día
            $table->unique(['employee_id', 'day_of_week', 'start_time'], 'unique_employee_day_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_schedules');
    }
};
