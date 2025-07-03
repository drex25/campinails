<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Promotion;
use Carbon\Carbon;

class PromotionSeeder extends Seeder
{
    public function run(): void
    {
        $promotions = [
            [
                'name' => 'Descuento de Verano',
                'description' => '20% de descuento en todos los servicios durante enero',
                'code' => 'VERANO20',
                'type' => 'percentage',
                'value' => 20.00,
                'min_amount' => 10000.00,
                'max_discount' => 5000.00,
                'usage_limit' => 100,
                'used_count' => 15,
                'is_active' => true,
                'starts_at' => Carbon::now()->subDays(10),
                'expires_at' => Carbon::now()->addDays(20),
                'applicable_days' => [1, 2, 3, 4, 5, 6], // Lunes a Sábado
                'applicable_services' => null, // Todos los servicios
            ],
            [
                'name' => 'Cliente Nuevo',
                'description' => '50% de descuento en el primer servicio para nuevos clientes',
                'code' => 'NUEVO50',
                'type' => 'percentage',
                'value' => 50.00,
                'min_amount' => null,
                'max_discount' => 10000.00,
                'usage_limit' => null, // Sin límite
                'used_count' => 0,
                'is_active' => false, // Programada para el futuro
                'starts_at' => Carbon::now()->addDays(5),
                'expires_at' => Carbon::now()->addMonths(3),
                'applicable_days' => null, // Todos los días
                'applicable_services' => null, // Todos los servicios
            ],
            [
                'name' => 'Referido Amiga',
                'description' => '$5000 de descuento por cada amiga que traigas',
                'code' => 'AMIGA5K',
                'type' => 'fixed',
                'value' => 5000.00,
                'min_amount' => 15000.00,
                'max_discount' => null,
                'usage_limit' => 20,
                'used_count' => 8,
                'is_active' => false, // Expirada
                'starts_at' => Carbon::now()->subMonths(2),
                'expires_at' => Carbon::now()->subDays(5),
                'applicable_days' => null,
                'applicable_services' => null,
            ],
            [
                'name' => 'Martes de Manicura',
                'description' => '15% de descuento en manicura todos los martes',
                'code' => 'MARTES15',
                'type' => 'percentage',
                'value' => 15.00,
                'min_amount' => null,
                'max_discount' => 3000.00,
                'usage_limit' => null,
                'used_count' => 23,
                'is_active' => true,
                'starts_at' => Carbon::now()->subMonth(),
                'expires_at' => Carbon::now()->addMonths(6),
                'applicable_days' => [2], // Solo martes
                'applicable_services' => [2], // Solo manicura (ID 2)
            ],
        ];

        foreach ($promotions as $promotion) {
            Promotion::create($promotion);
        }
    }
}