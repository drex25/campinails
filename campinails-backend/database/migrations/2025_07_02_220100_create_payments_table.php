<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appointment_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('ARS');
            $table->string('payment_method'); // card, transfer, cash, mercadopago, stripe
            $table->string('payment_provider')->nullable(); // stripe, mercadopago, etc
            $table->string('provider_payment_id')->nullable(); // ID del proveedor
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'])->default('pending');
            $table->json('metadata')->nullable(); // Datos adicionales del pago
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->decimal('refund_amount', 10, 2)->nullable();
            $table->timestamps();
            
            // Índices
            $table->index(['appointment_id', 'status']);
            $table->index(['payment_provider', 'provider_payment_id']);
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};