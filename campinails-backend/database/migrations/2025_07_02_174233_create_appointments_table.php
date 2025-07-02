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
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->onDelete('cascade');
            $table->foreignId('client_id')->constrained()->onDelete('cascade');
            $table->dateTime('scheduled_at');
            $table->dateTime('ends_at');
            $table->enum('status', [
                'pending_deposit',
                'confirmed',
                'rescheduled',
                'cancelled',
                'no_show',
                'completed'
            ])->default('pending_deposit');
            $table->decimal('total_price', 10, 2);
            $table->decimal('deposit_amount', 10, 2);
            $table->boolean('deposit_paid')->default(false);
            $table->dateTime('deposit_paid_at')->nullable();
            $table->integer('reschedule_count')->default(0);
            $table->text('special_requests')->nullable();
            $table->string('reference_photo')->nullable();
            $table->text('admin_notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
