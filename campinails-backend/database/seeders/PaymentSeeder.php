<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Payment;
use App\Models\Appointment;
use App\Models\Client;
use App\Models\Service;

class PaymentSeeder extends Seeder
{
    public function run(): void
    {
        // Obtener algunos turnos existentes
        $appointments = Appointment::with(['client', 'service'])->take(10)->get();
        
        if ($appointments->isEmpty()) {
            $this->command->info('No hay turnos disponibles para crear pagos de prueba.');
            return;
        }

        $paymentMethods = ['mercadopago', 'stripe', 'transfer', 'cash'];
        $paymentStatuses = ['completed', 'pending', 'processing', 'failed'];
        
        foreach ($appointments as $appointment) {
            // Crear 1-2 pagos por turno
            $numPayments = rand(1, 2);
            
            for ($i = 0; $i < $numPayments; $i++) {
                $method = $paymentMethods[array_rand($paymentMethods)];
                $status = $paymentStatuses[array_rand($paymentStatuses)];
                
                // Para transferencias, asegurar que estén pendientes
                if ($method === 'transfer') {
                    $status = 'pending';
                }
                
                // Para efectivo, asegurar que estén completados
                if ($method === 'cash') {
                    $status = 'completed';
                }
                
                Payment::create([
                    'appointment_id' => $appointment->id,
                    'amount' => $appointment->deposit_amount,
                    'currency' => 'ARS',
                    'payment_method' => $method,
                    'payment_provider' => $method === 'transfer' ? 'manual' : $method,
                    'status' => $status,
                    'metadata' => [
                        'service_name' => $appointment->service->name,
                        'client_name' => $appointment->client->name,
                        'test_payment' => true
                    ],
                    'paid_at' => $status === 'completed' ? now() : null,
                    'created_at' => now()->subDays(rand(1, 30)),
                    'updated_at' => now()->subDays(rand(1, 30)),
                ]);
            }
        }
        
        $this->command->info('Pagos de prueba creados exitosamente.');
    }
} 