<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Payment;
use App\Models\Appointment;
use App\Services\PaymentService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class PaymentController extends Controller
{
    protected $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    public function index(Request $request)
    {
        $query = Payment::with(['appointment.client', 'appointment.service']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        if ($request->has('appointment_id')) {
            $query->where('appointment_id', $request->appointment_id);
        }

        return response()->json(
            $query->orderBy('created_at', 'desc')->paginate(20)
        );
    }

    public function store(Request $request)
    {
        Log::info('Payment store called', [
            'request_data' => $request->all()
        ]);
        
        $validated = $request->validate([
            'appointment_id' => 'required|exists:appointments,id',
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|in:card,transfer,cash,mercadopago,stripe',
            'payment_provider' => 'nullable|string',
            'metadata' => 'nullable|array'
        ]);

        $appointment = Appointment::findOrFail($validated['appointment_id']);
        
        $payment = Payment::create([
            'appointment_id' => $appointment->id,
            'amount' => $validated['amount'],
            'payment_method' => $validated['payment_method'],
            'payment_provider' => $validated['payment_provider'] ?? $validated['payment_method'],
            'metadata' => $validated['metadata'] ?? [],
            'status' => 'pending'
        ]);

        // Procesar el pago según el método
        if (in_array($validated['payment_method'], ['mercadopago', 'stripe'])) {
            $result = $this->paymentService->processPayment($payment);
            
            if ($result['success']) {
                $payment->update([
                    'provider_payment_id' => $result['payment_id'],
                    'status' => 'processing'
                ]);
                
                // Devolver la URL de pago para redirigir al usuario
                return response()->json([
                    'payment' => $payment->load('appointment'),
                    'payment_url' => $result['init_point'] ?? $result['sandbox_init_point'] ?? $result['checkout_url'],
                    'payment_id' => $result['payment_id']
                ], 201);
            } else {
                $payment->update(['status' => 'failed']);
                return response()->json(['message' => $result['error']], 422);
            }
        } elseif ($validated['payment_method'] === 'transfer') {
            // Pago por transferencia se marca como pendiente
            $payment->update([
                'status' => 'processing',
                'payment_provider' => 'manual'
            ]);
            
            // El turno permanece como pending_deposit hasta que se confirme el pago
            
            // Si hay metadata con has_receipt, actualizar el estado del turno
            if (isset($validated['metadata']['has_receipt']) && $validated['metadata']['has_receipt']) {
                $appointment->update([
                    'admin_notes' => 'Comprobante de transferencia subido por el cliente. Pendiente de verificación.'
                ]);
            }
        } elseif ($validated['payment_method'] === 'cash') {
            // Pago en efectivo se marca como completado inmediatamente
            $payment->update([
                'status' => 'processing',
                'payment_provider' => 'manual'
            ]);
            
            // El turno permanece como pending_deposit hasta que se confirme el pago en el local
            $appointment->update([
                'admin_notes' => 'Cliente pagará en efectivo al llegar al local.'
            ]);
        }

        return response()->json($payment->load('appointment'), 201);
    }

    public function show(string $id)
    {
        $payment = Payment::with(['appointment.client', 'appointment.service'])->findOrFail($id);
        return response()->json($payment);
    }

    public function confirm(string $id)
    {
        $payment = Payment::findOrFail($id);
        
        if ($payment->status !== 'pending' && $payment->status !== 'processing') {
            return response()->json(['message' => 'El pago no puede ser confirmado'], 422);
        }

        $payment->update([
            'status' => 'completed',
            'paid_at' => now()
        ]);

        // Actualizar el turno
        $payment->appointment->update([
            'deposit_paid' => true,
            'deposit_paid_at' => now(),
            'status' => 'confirmed'
        ]);

        return response()->json(['message' => 'Pago confirmado exitosamente']);
    }

    public function refund(Request $request, string $id)
    {
        $validated = $request->validate([
            'amount' => 'nullable|numeric|min:0',
            'reason' => 'required|string'
        ]);

        $payment = Payment::findOrFail($id);
        
        if ($payment->status !== 'completed') {
            return response()->json(['message' => 'Solo se pueden reembolsar pagos completados'], 422);
        }

        $refundAmount = $validated['amount'] ?? $payment->amount;
        
        if ($refundAmount > $payment->amount) {
            return response()->json(['message' => 'El monto a reembolsar no puede ser mayor al pago'], 422);
        }

        $result = $this->paymentService->refundPayment($payment, $refundAmount, $validated['reason']);
        
        if ($result['success']) {
            $payment->update([
                'status' => 'refunded',
                'refunded_at' => now(),
                'refund_amount' => $refundAmount
            ]);

            return response()->json(['message' => 'Reembolso procesado exitosamente']);
        } else {
            return response()->json(['message' => $result['error']], 422);
        }
    }

    public function webhook(Request $request)
    {
        // Webhook para recibir notificaciones de los proveedores de pago
        Log::info('Payment webhook received', [
            'headers' => $request->headers->all(),
            'data' => $request->all()
        ]);
        
        // MercadoPago no envía un header específico, pero podemos detectarlo por el formato de datos
        $provider = 'mercadopago'; // Por defecto asumimos MercadoPago
        
        $result = $this->paymentService->handleWebhook($provider, $request->all());
        
        if ($result['success']) {
            return response()->json(['status' => 'ok']);
        } else {
            Log::error('Webhook error', ['error' => $result['error']]);
            return response()->json(['error' => $result['error']], 400);
        }
    }

    public function getTestData()
    {
        return response()->json([
            'mercadopago' => [
                'cards' => [
                    [
                        'number' => '5031 7557 3453 0604',
                        'cvv' => '123',
                        'expiry' => '11/30',
                        'description' => 'Mastercard (aprobada)'
                    ],
                    [
                        'number' => '4509 9535 6623 3704',
                        'cvv' => '123',
                        'expiry' => '11/30',
                        'description' => 'Visa (aprobada)'
                    ],
                    [
                        'number' => '3711 803032 57522',
                        'cvv' => '1234',
                        'expiry' => '11/30',
                        'description' => 'American Express (aprobada)'
                    ],
                    [
                        'number' => '5287 3383 1025 3304',
                        'cvv' => '123',
                        'expiry' => '11/30',
                        'description' => 'Mastercard Débito (aprobada)'
                    ],
                    [
                        'number' => '4002 7686 9439 5619',
                        'cvv' => '123',
                        'expiry' => '11/30',
                        'description' => 'Visa Débito (aprobada)'
                    ]
                ],
                'dni' => '12345678',
                'email' => 'test@test.com',
                'payment_states' => [
                    [
                        'state' => 'APRO',
                        'description' => 'Pago aprobado',
                        'dni' => '12345678'
                    ],
                    [
                        'state' => 'OTHE',
                        'description' => 'Rechazado por error general',
                        'dni' => '12345678'
                    ],
                    [
                        'state' => 'CONT',
                        'description' => 'Pendiente de pago',
                        'dni' => null
                    ],
                    [
                        'state' => 'CALL',
                        'description' => 'Rechazado con validación para autorizar',
                        'dni' => null
                    ],
                    [
                        'state' => 'FUND',
                        'description' => 'Rechazado por importe insuficiente',
                        'dni' => null
                    ],
                    [
                        'state' => 'SECU',
                        'description' => 'Rechazado por código de seguridad inválido',
                        'dni' => null
                    ],
                    [
                        'state' => 'EXPI',
                        'description' => 'Rechazado por fecha de vencimiento',
                        'dni' => null
                    ],
                    [
                        'state' => 'FORM',
                        'description' => 'Rechazado por error de formulario',
                        'dni' => null
                    ]
                ]
            ]
        ]);
    }

    public function checkPaymentStatus(string $id)
    {
        $payment = Payment::findOrFail($id);
        
        if ($payment->payment_provider === 'mercadopago' && $payment->provider_payment_id) {
            $accessToken = config('services.mercadopago.access_token');
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken
            ])->get("https://api.mercadopago.com/v1/payments/{$payment->provider_payment_id}");

            if ($response->successful()) {
                $paymentData = $response->json();
                
                // Si estamos en desarrollo y el pago está aprobado, actualizar automáticamente
                if (config('app.env') === 'local' && $paymentData['status'] === 'approved' && $payment->status !== 'completed') {
                    $payment->update([
                        'status' => 'completed',
                        'paid_at' => now()
                    ]);
                    
                    $payment->appointment->update([
                        'deposit_paid' => true,
                        'deposit_paid_at' => now(),
                        'status' => 'confirmed'
                    ]);
                    
                    Log::info('Payment auto-completed in development', [
                        'payment_id' => $payment->id,
                        'appointment_id' => $payment->appointment->id
                    ]);
                }
                
                return response()->json([
                    'payment' => $payment->fresh(),
                    'mercadopago_status' => $paymentData['status'],
                    'mercadopago_data' => $paymentData,
                    'auto_updated' => config('app.env') === 'local' && $paymentData['status'] === 'approved'
                ]);
            }
        }
        
        return response()->json(['payment' => $payment]);
    }
}