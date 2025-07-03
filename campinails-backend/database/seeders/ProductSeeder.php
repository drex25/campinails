<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            // Esmaltes
            [
                'name' => 'Esmalte Gel UV Rosa Pastel',
                'description' => 'Esmalte gel de larga duración color rosa pastel',
                'sku' => 'ESM-001',
                'category' => 'Esmaltes',
                'brand' => 'OPI',
                'cost_price' => 2500,
                'selling_price' => 4000,
                'stock_quantity' => 5,
                'min_stock_level' => 10,
                'max_stock_level' => 50,
                'unit' => 'unidad',
                'is_active' => true,
                'notes' => 'Color muy popular'
            ],
            [
                'name' => 'Esmalte Gel UV Rojo Clásico',
                'description' => 'Esmalte gel rojo intenso',
                'sku' => 'ESM-002',
                'category' => 'Esmaltes',
                'brand' => 'Essie',
                'cost_price' => 2800,
                'selling_price' => 4200,
                'stock_quantity' => 15,
                'min_stock_level' => 8,
                'max_stock_level' => 40,
                'unit' => 'unidad',
                'is_active' => true,
            ],
            [
                'name' => 'Esmalte Gel UV Nude',
                'description' => 'Esmalte gel color nude natural',
                'sku' => 'ESM-003',
                'category' => 'Esmaltes',
                'brand' => 'CND',
                'cost_price' => 3000,
                'selling_price' => 4500,
                'stock_quantity' => 12,
                'min_stock_level' => 10,
                'max_stock_level' => 35,
                'unit' => 'unidad',
                'is_active' => true,
            ],
            
            // Herramientas
            [
                'name' => 'Lima de Uñas Profesional 180/240',
                'description' => 'Lima de uñas grano 180/240',
                'sku' => 'LIM-001',
                'category' => 'Herramientas',
                'brand' => 'Nail Pro',
                'cost_price' => 150,
                'selling_price' => 300,
                'stock_quantity' => 25,
                'min_stock_level' => 20,
                'max_stock_level' => 100,
                'unit' => 'unidad',
                'is_active' => true,
            ],
            [
                'name' => 'Pusher de Cutículas',
                'description' => 'Empujador de cutículas de acero inoxidable',
                'sku' => 'PUSH-001',
                'category' => 'Herramientas',
                'brand' => 'Nail Art',
                'cost_price' => 800,
                'selling_price' => 1200,
                'stock_quantity' => 8,
                'min_stock_level' => 5,
                'max_stock_level' => 25,
                'unit' => 'unidad',
                'is_active' => true,
            ],
            [
                'name' => 'Alicate de Cutículas',
                'description' => 'Alicate profesional para cutículas',
                'sku' => 'ALI-001',
                'category' => 'Herramientas',
                'brand' => 'Professional',
                'cost_price' => 2500,
                'selling_price' => 4000,
                'stock_quantity' => 3,
                'min_stock_level' => 5,
                'max_stock_level' => 15,
                'unit' => 'unidad',
                'is_active' => true,
                'notes' => 'Stock bajo - reordenar'
            ],
            
            // Tratamientos
            [
                'name' => 'Base Coat Fortalecedora',
                'description' => 'Base coat que fortalece las uñas',
                'sku' => 'BASE-001',
                'category' => 'Tratamientos',
                'brand' => 'Essie',
                'cost_price' => 1800,
                'selling_price' => 3200,
                'stock_quantity' => 0,
                'min_stock_level' => 5,
                'max_stock_level' => 30,
                'unit' => 'unidad',
                'is_active' => true,
                'notes' => 'Agotado - reordenar urgente'
            ],
            [
                'name' => 'Top Coat Brillo',
                'description' => 'Top coat de alto brillo',
                'sku' => 'TOP-001',
                'category' => 'Tratamientos',
                'brand' => 'OPI',
                'cost_price' => 2000,
                'selling_price' => 3500,
                'stock_quantity' => 18,
                'min_stock_level' => 8,
                'max_stock_level' => 40,
                'unit' => 'unidad',
                'is_active' => true,
            ],
            [
                'name' => 'Aceite de Cutículas',
                'description' => 'Aceite nutritivo para cutículas',
                'sku' => 'ACE-001',
                'category' => 'Tratamientos',
                'brand' => 'CND',
                'cost_price' => 1200,
                'selling_price' => 2000,
                'stock_quantity' => 22,
                'min_stock_level' => 10,
                'max_stock_level' => 50,
                'unit' => 'unidad',
                'is_active' => true,
            ],
            
            // Accesorios
            [
                'name' => 'Lámpara UV/LED 36W',
                'description' => 'Lámpara para curado de gel',
                'sku' => 'LAM-001',
                'category' => 'Accesorios',
                'brand' => 'Nail Tech',
                'cost_price' => 8000,
                'selling_price' => 12000,
                'stock_quantity' => 2,
                'min_stock_level' => 2,
                'max_stock_level' => 8,
                'unit' => 'unidad',
                'is_active' => true,
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}