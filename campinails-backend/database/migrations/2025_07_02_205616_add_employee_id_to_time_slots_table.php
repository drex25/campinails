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
        Schema::table('time_slots', function (Blueprint $table) {
            $table->foreignId('employee_id')->nullable()->constrained()->onDelete('set null');
            
            // Actualizar el índice único para incluir employee_id
            $table->dropUnique('unique_service_date_time');
            $table->unique(['service_id', 'date', 'start_time', 'employee_id'], 'unique_service_date_time_employee');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('time_slots', function (Blueprint $table) {
            $table->dropForeign(['employee_id']);
            $table->dropColumn('employee_id');
            
            // Restaurar el índice original
            $table->dropUnique('unique_service_date_time_employee');
            $table->unique(['service_id', 'date', 'start_time'], 'unique_service_date_time');
        });
    }
};
