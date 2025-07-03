<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['in', 'out']); // Entrada o salida
            $table->integer('quantity');
            $table->string('reason'); // purchase, sale, adjustment, waste, etc
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Índices
            $table->index(['product_id', 'type']);
            $table->index(['created_at', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};