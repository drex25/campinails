<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Client;

class ClientSeeder extends Seeder
{
    public function run(): void
    {
        $clients = [
            [
                'name' => 'María González',
                'whatsapp' => '1123456789',
                'email' => 'maria.gonzalez@email.com',
                'notes' => 'Prefiere colores pasteles',
                'is_active' => true,
            ],
            [
                'name' => 'Ana Rodríguez',
                'whatsapp' => '1134567890',
                'email' => 'ana.rodriguez@email.com',
                'notes' => 'Cliente VIP, siempre puntual',
                'is_active' => true,
            ],
            [
                'name' => 'Laura Fernández',
                'whatsapp' => '1145678901',
                'email' => 'laura.fernandez@email.com',
                'is_active' => true,
            ],
            [
                'name' => 'Sofía Martín',
                'whatsapp' => '1156789012',
                'email' => 'sofia.martin@email.com',
                'notes' => 'Alérgica a ciertos productos',
                'is_active' => true,
            ],
            [
                'name' => 'Valentina López',
                'whatsapp' => '1167890123',
                'email' => 'valentina.lopez@email.com',
                'is_active' => true,
            ],
        ];

        foreach ($clients as $client) {
            Client::create($client);
        }
    }
}