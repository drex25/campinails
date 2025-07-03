<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Payment;
use App\Models\Appointment;
use App\Services\PaymentService;

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
            'payment_provider' => $validated['payment_provider'],
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
            } else {
                $payment->update(['status' => 'failed']);
                return response()->json(['message' => $result['error']], 422);
            }
        } elseif ($validated['payment_method'] === 'cash') {
            // Pago en efectivo se marca como completado inmediatamente
            $payment->update([
                'status' => 'completed',
                'paid_at' => now()
            ]);
            
            // Actualizar el turno
            $appointment->update([
                'deposit_paid' => true,
                'deposit_paid_at' => now(),
                'status' => 'confirmed'
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
        $provider = $request->header('X-Payment-Provider', 'unknown');
        
        $result = $this->paymentService->handleWebhook($provider, $request->all());
        
        if ($result['success']) {
            return response()->json(['status' => 'ok']);
        } else {
            return response()->json(['error' => $result['error']], 400);
        }
    }
}