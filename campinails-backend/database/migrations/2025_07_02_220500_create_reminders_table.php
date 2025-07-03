<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reminders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appointment_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['confirmation', 'reminder_24h', 'reminder_2h', 'follow_up']);
            $table->timestamp('scheduled_for');
            $table->enum('status', ['pending', 'sent', 'failed'])->default('pending');
            $table->timestamp('sent_at')->nullable();
            $table->text('message');
            $table->string('channel')->default('whatsapp'); // whatsapp, email, sms
            $table->timestamps();
            
            // Índices
            $table->index(['status', 'scheduled_for']);
            $table->index(['appointment_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reminders');
    }
};