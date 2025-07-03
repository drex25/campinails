<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Crear usuario admin
        User::create([
            'name' => 'Administrador',
            'email' => 'admin@campinails.com',
            'password' => Hash::make('admin123'),
        ]);

        // Crear servicios y empleados
        $this->call([
            ServiceSeeder::class,
            EmployeeSeeder::class,
            ClientSeeder::class,
            ProductSeeder::class,
            PromotionSeeder::class,
        ]);
    }
}