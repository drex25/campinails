<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\TimeSlot;
use App\Models\Service;
use Carbon\Carbon;

class TimeSlotSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $services = Service::where('is_active', true)->get();
        
        // Crear slots para los próximos 7 días
        for ($i = 1; $i <= 7; $i++) {
            $date = Carbon::now()->addDays($i);
            
            // Solo crear slots de lunes a sábado (1=Lunes, 6=Sábado)
            if ($date->dayOfWeek >= 1 && $date->dayOfWeek <= 6) {
                foreach ($services as $service) {
                    // Crear slots de 30 minutos desde las 9:00 hasta las 18:00
                    TimeSlot::createSlotsForService(
                        $service->id,
                        $date->format('Y-m-d'),
                        '09:00',
                        '18:00',
                        30 // 30 minutos por slot
                    );
                }
            }
        }
        
        $this->command->info('TimeSlots creados exitosamente para los próximos 7 días.');
    }
}
