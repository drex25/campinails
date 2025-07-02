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
        Schema::table('appointments', function (Blueprint $table) {
            $table->foreignId('employee_id')->nullable()->constrained()->onDelete('set null');
            
            // Índices para optimizar consultas
            $table->index(['employee_id', 'scheduled_at']);
            $table->index(['employee_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropForeign(['employee_id']);
            $table->dropIndex(['employee_id', 'scheduled_at']);
            $table->dropIndex(['employee_id', 'status']);
            $table->dropColumn('employee_id');
        });
    }
};
