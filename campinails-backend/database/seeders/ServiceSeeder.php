<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Service;

class ServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $services = [
            [
                'name' => 'Retiro de semi/capping/soft',
                'description' => null,
                'duration_minutes' => 30,
                'price' => 5000,
            ],
            [
                'name' => 'Manicuria',
                'description' => null,
                'duration_minutes' => 30,
                'price' => 10000,
            ],
            [
                'name' => 'Esmaltado semi permanente',
                'description' => null,
                'duration_minutes' => 60,
                'price' => 15000,
            ],
            [
                'name' => 'Capping con polygel',
                'description' => null,
                'duration_minutes' => 120,
                'price' => 20000,
            ],
            [
                'name' => 'Nivelación',
                'description' => null,
                'duration_minutes' => 90,
                'price' => 17000,
            ],
            [
                'name' => 'Soft Gel',
                'description' => null,
                'duration_minutes' => 180,
                'price' => 25000,
            ],
            [
                'name' => 'Pies',
                'description' => null,
                'duration_minutes' => 60,
                'price' => 15000,
            ],
        ];

        foreach ($services as $service) {
            Service::create($service);
        }
    }
}
