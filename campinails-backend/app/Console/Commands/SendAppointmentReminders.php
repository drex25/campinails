<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Appointment;
use App\Models\Reminder;
use App\Services\NotificationService;
use Carbon\Carbon;

class SendAppointmentReminders extends Command
{
    protected $signature = 'appointments:send-reminders';
    protected $description = 'Send appointment reminders';

    public function handle()
    {
        $notificationService = app(NotificationService::class);
        
        $this->send24HourReminders($notificationService);
        $this->send2HourReminders($notificationService);
        $this->sendFollowUps($notificationService);
    }
    
    private function send24HourReminders($notificationService)
    {
        $tomorrow = now()->addDay();
        
        $appointments = Appointment::whereDate('scheduled_at', $tomorrow->toDateString())
                                  ->where('status', 'confirmed')
                                  ->whereDoesntHave('reminders', function($q) {
                                      $q->where('type', 'reminder_24h');
                                  })
                                  ->get();
        
        foreach ($appointments as $appointment) {
            $notificationService->sendAppointmentReminder($appointment, 'reminder_24h');
            
            Reminder::create([
                'appointment_id' => $appointment->id,
                'type' => 'reminder_24h',
                'scheduled_for' => now(),
                'status' => 'sent',
                'sent_at' => now(),
                'message' => 'Recordatorio 24h enviado',
                'channel' => 'whatsapp'
            ]);
        }
        
        $this->info("Sent 24h reminders: " . count($appointments));
    }
    
    private function send2HourReminders($notificationService)
    {
        $in2Hours = now()->addHours(2);
        
        $appointments = Appointment::whereBetween('scheduled_at', [
                                      $in2Hours->copy()->subMinutes(30),
                                      $in2Hours->copy()->addMinutes(30)
                                  ])
                                  ->where('status', 'confirmed')
                                  ->whereDoesntHave('reminders', function($q) {
                                      $q->where('type', 'reminder_2h');
                                  })
                                  ->get();
        
        foreach ($appointments as $appointment) {
            $notificationService->sendAppointmentReminder($appointment, 'reminder_2h');
            
            Reminder::create([
                'appointment_id' => $appointment->id,
                'type' => 'reminder_2h',
                'scheduled_for' => now(),
                'status' => 'sent',
                'sent_at' => now(),
                'message' => 'Recordatorio 2h enviado',
                'channel' => 'whatsapp'
            ]);
        }
        
        $this->info("Sent 2h reminders: " . count($appointments));
    }
    
    private function sendFollowUps($notificationService)
    {
        $yesterday = now()->subDay();
        
        $appointments = Appointment::whereDate('scheduled_at', $yesterday->toDateString())
                                  ->where('status', 'completed')
                                  ->whereDoesntHave('reminders', function($q) {
                                      $q->where('type', 'follow_up');
                                  })
                                  ->get();
        
        foreach ($appointments as $appointment) {
            $message = "¡Hola {$appointment->client->name}! Esperamos que hayas disfrutado tu experiencia en Campi Nails ayer. ¡Nos encantaría verte pronto! 💅✨";
            
            $notification = \App\Models\Notification::create([
                'type' => 'whatsapp',
                'recipient_type' => 'client',
                'recipient_id' => $appointment->client_id,
                'title' => 'Gracias por visitarnos - Campi Nails',
                'message' => $message,
                'data' => ['appointment_id' => $appointment->id]
            ]);
            
            $notificationService->send($notification);
            
            Reminder::create([
                'appointment_id' => $appointment->id,
                'type' => 'follow_up',
                'scheduled_for' => now(),
                'status' => 'sent',
                'sent_at' => now(),
                'message' => 'Follow-up enviado',
                'channel' => 'whatsapp'
            ]);
        }
        
        $this->info("Sent follow-ups: " . count($appointments));
    }
}