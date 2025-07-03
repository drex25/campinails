<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // whatsapp, email, sms, push
            $table->string('recipient_type'); // client, employee, admin
            $table->unsignedBigInteger('recipient_id');
            $table->string('title');
            $table->text('message');
            $table->json('data')->nullable(); // Datos adicionales
            $table->enum('status', ['pending', 'sent', 'failed', 'cancelled'])->default('pending');
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamp('scheduled_for')->nullable(); // Para notificaciones programadas
            $table->timestamps();
            
            // Índices
            $table->index(['recipient_type', 'recipient_id']);
            $table->index(['status', 'scheduled_for']);
            $table->index(['type', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};