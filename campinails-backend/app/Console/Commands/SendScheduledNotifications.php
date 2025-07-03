<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Notification;
use App\Services\NotificationService;

class SendScheduledNotifications extends Command
{
    protected $signature = 'notifications:send-scheduled';
    protected $description = 'Send scheduled notifications';

    public function handle()
    {
        $notificationService = app(NotificationService::class);
        
        $notifications = Notification::scheduled()->get();
        
        $sent = 0;
        $failed = 0;
        
        foreach ($notifications as $notification) {
            if ($notificationService->send($notification)) {
                $sent++;
            } else {
                $failed++;
            }
        }
        
        $this->info("Sent: {$sent}, Failed: {$failed}");
    }
}