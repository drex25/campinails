<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Notification;
use App\Services\NotificationService;

class NotificationController extends Controller
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    public function index(Request $request)
    {
        $query = Notification::query();

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('recipient_type')) {
            $query->where('recipient_type', $request->recipient_type);
        }

        return response()->json(
            $query->orderBy('created_at', 'desc')->paginate(20)
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:whatsapp,email,sms,push',
            'recipient_type' => 'required|in:client,employee,admin',
            'recipient_id' => 'required|integer',
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'scheduled_for' => 'nullable|date|after:now',
            'data' => 'nullable|array'
        ]);

        $notification = Notification::create($validated);

        // Si no está programada, enviar inmediatamente
        if (!$validated['scheduled_for']) {
            $this->notificationService->send($notification);
        }

        return response()->json($notification, 201);
    }

    public function show(string $id)
    {
        $notification = Notification::findOrFail($id);
        return response()->json($notification);
    }

    public function markAsRead(string $id)
    {
        $notification = Notification::findOrFail($id);
        $notification->markAsRead();
        
        return response()->json(['message' => 'Notificación marcada como leída']);
    }

    public function resend(string $id)
    {
        $notification = Notification::findOrFail($id);
        
        if ($notification->status === 'sent') {
            return response()->json(['message' => 'La notificación ya fue enviada'], 422);
        }

        $this->notificationService->send($notification);
        
        return response()->json(['message' => 'Notificación reenviada']);
    }

    public function sendBulk(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:whatsapp,email,sms,push',
            'recipient_type' => 'required|in:client,employee,admin',
            'recipient_ids' => 'required|array',
            'recipient_ids.*' => 'integer',
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'scheduled_for' => 'nullable|date|after:now'
        ]);

        $notifications = [];
        
        foreach ($validated['recipient_ids'] as $recipientId) {
            $notification = Notification::create([
                'type' => $validated['type'],
                'recipient_type' => $validated['recipient_type'],
                'recipient_id' => $recipientId,
                'title' => $validated['title'],
                'message' => $validated['message'],
                'scheduled_for' => $validated['scheduled_for'] ?? null
            ]);

            $notifications[] = $notification;

            // Si no está programada, enviar inmediatamente
            if (!$validated['scheduled_for']) {
                $this->notificationService->send($notification);
            }
        }

        return response()->json([
            'message' => 'Notificaciones creadas exitosamente',
            'count' => count($notifications)
        ], 201);
    }
}