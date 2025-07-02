<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Employee;
use App\Models\EmployeeSchedule;
use App\Models\Service;

class EmployeeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener IDs reales de los servicios por nombre
        $servicios = Service::pluck('id', 'name')->toArray();

        // Crear empleados
        $employees = [
            [
                'name' => 'María González',
                'email' => 'maria@campinails.com',
                'phone' => '11-1234-5678',
                'specialties' => ['Manicura', 'Esmaltado semi permanente'],
                'notes' => 'Especialista en diseños franceses',
                'services' => [
                    $servicios['Retiro de semi/capping/soft'] ?? null,
                    $servicios['Manicuria'] ?? null,
                    $servicios['Esmaltado semi permanente'] ?? null,
                ],
                'schedules' => [
                    ['day' => 1, 'start' => '09:00', 'end' => '18:00'], // Lunes
                    ['day' => 2, 'start' => '09:00', 'end' => '18:00'], // Martes
                    ['day' => 3, 'start' => '09:00', 'end' => '18:00'], // Miércoles
                    ['day' => 4, 'start' => '09:00', 'end' => '18:00'], // Jueves
                    ['day' => 5, 'start' => '09:00', 'end' => '18:00'], // Viernes
                    ['day' => 6, 'start' => '09:00', 'end' => '16:00'], // Sábado
                ]
            ],
            [
                'name' => 'Ana Rodríguez',
                'email' => 'ana@campinails.com',
                'phone' => '11-2345-6789',
                'specialties' => ['Capping', 'Soft Gel', 'Diseños 3D'],
                'notes' => 'Especialista en uñas largas y diseños complejos',
                'services' => [
                    $servicios['Capping con polygel'] ?? null,
                    $servicios['Nivelación'] ?? null,
                    $servicios['Soft Gel'] ?? null,
                ],
                'schedules' => [
                    ['day' => 1, 'start' => '10:00', 'end' => '19:00'], // Lunes
                    ['day' => 2, 'start' => '10:00', 'end' => '19:00'], // Martes
                    ['day' => 3, 'start' => '10:00', 'end' => '19:00'], // Miércoles
                    ['day' => 4, 'start' => '10:00', 'end' => '19:00'], // Jueves
                    ['day' => 5, 'start' => '10:00', 'end' => '19:00'], // Viernes
                    ['day' => 6, 'start' => '09:00', 'end' => '17:00'], // Sábado
                ]
            ],
            [
                'name' => 'Laura Fernández',
                'email' => 'laura@campinails.com',
                'phone' => '11-3456-7890',
                'specialties' => ['Pedicura', 'Manicura básica'],
                'notes' => 'Especialista en pies y tratamientos relajantes',
                'services' => [
                    $servicios['Retiro de semi/capping/soft'] ?? null,
                    $servicios['Manicuria'] ?? null,
                    $servicios['Pies'] ?? null,
                ],
                'schedules' => [
                    ['day' => 1, 'start' => '09:00', 'end' => '17:00'], // Lunes
                    ['day' => 2, 'start' => '09:00', 'end' => '17:00'], // Martes
                    ['day' => 3, 'start' => '09:00', 'end' => '17:00'], // Miércoles
                    ['day' => 4, 'start' => '09:00', 'end' => '17:00'], // Jueves
                    ['day' => 5, 'start' => '09:00', 'end' => '17:00'], // Viernes
                    ['day' => 6, 'start' => '09:00', 'end' => '15:00'], // Sábado
                ]
            ]
        ];

        foreach ($employees as $employeeData) {
            $services = array_filter($employeeData['services']); // Elimina nulls si algún servicio no existe
            $schedules = $employeeData['schedules'];
            
            unset($employeeData['services'], $employeeData['schedules']);
            
            $employee = Employee::create($employeeData);
            
            // Asignar servicios
            $employee->services()->attach($services);
            
            // Crear horarios
            foreach ($schedules as $schedule) {
                EmployeeSchedule::create([
                    'employee_id' => $employee->id,
                    'day_of_week' => $schedule['day'],
                    'start_time' => $schedule['start'],
                    'end_time' => $schedule['end'],
                    'is_active' => true
                ]);
            }
        }
        
        $this->command->info('Empleados creados exitosamente con sus horarios y servicios asignados.');
    }
}
