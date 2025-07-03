<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\Client;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class NotificationService
{
    public function send(Notification $notification)
    {
        try {
            $recipient = $this->getRecipient($notification);
            
            if (!$recipient) {
                $notification->markAsFailed();
                return false;
            }

            $success = false;

            switch ($notification->type) {
                case 'whatsapp':
                    $success = $this->sendWhatsApp($notification, $recipient);
                    break;
                case 'email':
                    $success = $this->sendEmail($notification, $recipient);
                    break;
                case 'sms':
                    $success = $this->sendSMS($notification, $recipient);
                    break;
                case 'push':
                    $success = $this->sendPush($notification, $recipient);
                    break;
            }

            if ($success) {
                $notification->markAsSent();
            } else {
                $notification->markAsFailed();
            }

            return $success;

        } catch (\Exception $e) {
            Log::error('Error sending notification: ' . $e->getMessage(), [
                'notification_id' => $notification->id,
                'type' => $notification->type
            ]);
            
            $notification->markAsFailed();
            return false;
        }
    }

    private function getRecipient(Notification $notification)
    {
        switch ($notification->recipient_type) {
            case 'client':
                return Client::find($notification->recipient_id);
            case 'employee':
                return Employee::find($notification->recipient_id);
            case 'admin':
                return User::find($notification->recipient_id);
            default:
                return null;
        }
    }

    private function sendWhatsApp(Notification $notification, $recipient)
    {
        $whatsappNumber = $this->getWhatsAppNumber($recipient);
        
        if (!$whatsappNumber) {
            return false;
        }

        $twilioSid = config('services.twilio.sid');
        $twilioToken = config('services.twilio.token');
        $twilioWhatsAppNumber = config('services.twilio.whatsapp_number');

        if (!$twilioSid || !$twilioToken || !$twilioWhatsAppNumber) {
            Log::warning('Twilio WhatsApp credentials not configured');
            return false;
        }

        try {
            $response = Http::withBasicAuth($twilioSid, $twilioToken)
                ->asForm()
                ->post("https://api.twilio.com/2010-04-01/Accounts/{$twilioSid}/Messages.json", [
                    'From' => "whatsapp:{$twilioWhatsAppNumber}",
                    'To' => "whatsapp:{$whatsappNumber}",
                    'Body' => $notification->message
                ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('WhatsApp send error: ' . $e->getMessage());
            return false;
        }
    }

    private function sendEmail(Notification $notification, $recipient)
    {
        $email = $this->getEmail($recipient);
        
        if (!$email) {
            return false;
        }

        try {
            \Mail::raw($notification->message, function ($message) use ($email, $notification) {
                $message->to($email)
                        ->subject($notification->title);
            });

            return true;
        } catch (\Exception $e) {
            Log::error('Email send error: ' . $e->getMessage());
            return false;
        }
    }

    private function sendSMS(Notification $notification, $recipient)
    {
        $phoneNumber = $this->getPhoneNumber($recipient);
        
        if (!$phoneNumber) {
            return false;
        }

        $twilioSid = config('services.twilio.sid');
        $twilioToken = config('services.twilio.token');
        $twilioPhoneNumber = config('services.twilio.phone_number');

        if (!$twilioSid || !$twilioToken || !$twilioPhoneNumber) {
            Log::warning('Twilio SMS credentials not configured');
            return false;
        }

        try {
            $response = Http::withBasicAuth($twilioSid, $twilioToken)
                ->asForm()
                ->post("https://api.twilio.com/2010-04-01/Accounts/{$twilioSid}/Messages.json", [
                    'From' => $twilioPhoneNumber,
                    'To' => $phoneNumber,
                    'Body' => $notification->message
                ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('SMS send error: ' . $e->getMessage());
            return false;
        }
    }

    private function sendPush(Notification $notification, $recipient)
    {
        // Integración con Firebase Cloud Messaging
        return true;
    }

    private function getWhatsAppNumber($recipient)
    {
        if ($recipient instanceof Client) {
            return $recipient->whatsapp;
        } elseif ($recipient instanceof Employee) {
            return $recipient->phone;
        }
        return null;
    }

    private function getEmail($recipient)
    {
        return $recipient->email ?? null;
    }

    private function getPhoneNumber($recipient)
    {
        if ($recipient instanceof Client) {
            return $recipient->whatsapp;
        } elseif ($recipient instanceof Employee) {
            return $recipient->phone;
        }
        return null;
    }

    public function sendAppointmentConfirmation($appointment)
    {
        $message = "¡Hola {$appointment->client->name}! Tu turno para {$appointment->service->name} ha sido confirmado para el {$appointment->formatted_scheduled_at}. ¡Te esperamos! 💅✨";
        
        return $this->createAndSend([
            'type' => 'whatsapp',
            'recipient_type' => 'client',
            'recipient_id' => $appointment->client_id,
            'title' => 'Turno Confirmado - Campi Nails',
            'message' => $message,
            'data' => ['appointment_id' => $appointment->id]
        ]);
    }

    public function sendAppointmentReminder($appointment, $type = 'reminder_24h')
    {
        $timeText = $type === 'reminder_24h' ? 'mañana' : 'en 2 horas';
        $message = "¡Hola {$appointment->client->name}! Te recordamos que tienes tu turno {$timeText} a las {$appointment->scheduled_at->format('H:i')} para {$appointment->service->name}. ¡Te esperamos! 💅";
        
        return $this->createAndSend([
            'type' => 'whatsapp',
            'recipient_type' => 'client',
            'recipient_id' => $appointment->client_id,
            'title' => 'Recordatorio de Turno - Campi Nails',
            'message' => $message,
            'data' => ['appointment_id' => $appointment->id, 'reminder_type' => $type]
        ]);
    }

    public function sendPaymentConfirmation($payment)
    {
        $appointment = $payment->appointment;
        $message = "¡Perfecto! Hemos recibido tu pago de {$payment->formatted_amount} para tu turno del {$appointment->formatted_scheduled_at}. Tu reserva está confirmada. ¡Gracias! 💖";
        
        return $this->createAndSend([
            'type' => 'whatsapp',
            'recipient_type' => 'client',
            'recipient_id' => $appointment->client_id,
            'title' => 'Pago Confirmado - Campi Nails',
            'message' => $message,
            'data' => ['payment_id' => $payment->id, 'appointment_id' => $appointment->id]
        ]);
    }

    private function createAndSend(array $data)
    {
        $notification = Notification::create($data);
        return $this->send($notification);
    }
}