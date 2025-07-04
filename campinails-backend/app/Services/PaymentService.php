<?php

namespace App\Services;

use App\Models\Payment;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class PaymentService
{
    public function processPayment(Payment $payment)
    {
        switch ($payment->payment_provider) {
            case 'mercadopago':
                return $this->processMercadoPago($payment);
            case 'stripe':
                return $this->processStripe($payment);
            default:
                return ['success' => false, 'error' => 'Proveedor de pago no soportado'];
        }
    }

    private function processMercadoPago(Payment $payment)
    {
        $accessToken = config('services.mercadopago.access_token');
        
        if (!$accessToken) {
            return ['success' => false, 'error' => 'MercadoPago no configurado'];
        }

        try {
            $appointment = $payment->appointment;
            
            $preferenceData = [
                'items' => [
                    [
                        'title' => $appointment->service->name,
                        'quantity' => 1,
                        'unit_price' => (float) $payment->amount,
                        'currency_id' => 'ARS'
                    ]
                ],
                'payer' => [
                    'name' => $appointment->client->name,
                    'email' => $appointment->client->email ?? 'cliente@campinails.com',
                    'phone' => [
                        'number' => $appointment->client->whatsapp
                    ]
                ],
                'external_reference' => $payment->id
            ];

            // Solo agregar URLs de callback si estamos en producción
            if (config('app.env') === 'production') {
                $preferenceData['back_urls'] = [
                    'success' => config('app.url') . '/payment/success',
                    'failure' => config('app.url') . '/payment/failure',
                    'pending' => config('app.url') . '/payment/pending'
                ];
                $preferenceData['notification_url'] = config('app.url') . '/api/payments/webhook';
                $preferenceData['auto_return'] = 'approved';
            }

            Log::info('MercadoPago preference data', $preferenceData);
            Log::info('MercadoPago access token', ['token' => substr($accessToken, 0, 10) . '...']);
            if (isset($preferenceData['back_urls'])) {
                Log::info('MercadoPago back_urls', $preferenceData['back_urls']);
            }
            
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
                'Content-Type' => 'application/json'
            ])->post('https://api.mercadopago.com/checkout/preferences', $preferenceData);
            
            Log::info('MercadoPago response status', ['status' => $response->status()]);

            if ($response->successful()) {
                $data = $response->json();
                Log::info('MercadoPago successful response', $data);
                
                $paymentUrl = $data['init_point'] ?? $data['sandbox_init_point'] ?? null;
                Log::info('Payment URL extracted', ['url' => $paymentUrl]);
                
                return [
                    'success' => true,
                    'payment_id' => $data['id'],
                    'init_point' => $data['init_point'],
                    'sandbox_init_point' => $data['sandbox_init_point'],
                    'checkout_url' => $paymentUrl
                ];
            } else {
                $errorData = $response->json();
                Log::error('MercadoPago error: ' . json_encode($errorData));
                return ['success' => false, 'error' => 'Error al procesar el pago: ' . ($errorData['message'] ?? 'Error desconocido')];
            }

        } catch (\Exception $e) {
            Log::error('MercadoPago exception: ' . $e->getMessage());
            return ['success' => false, 'error' => 'Error interno del servidor'];
        }
    }

    private function processStripe(Payment $payment)
    {
        $secretKey = config('services.stripe.secret');
        
        if (!$secretKey) {
            return ['success' => false, 'error' => 'Stripe no configurado'];
        }

        try {
            $appointment = $payment->appointment;
            
            $sessionData = [
                'payment_method_types' => ['card'],
                'line_items' => [
                    [
                        'price_data' => [
                            'currency' => 'ars',
                            'product_data' => [
                                'name' => $appointment->service->name,
                                'description' => 'Turno en Campi Nails'
                            ],
                            'unit_amount' => (int) ($payment->amount * 100)
                        ],
                        'quantity' => 1
                    ]
                ],
                'mode' => 'payment',
                'success_url' => 'http://localhost:5173/payment/success?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => 'http://localhost:5173/payment/cancel',
                'metadata' => [
                    'payment_id' => $payment->id,
                    'appointment_id' => $appointment->id
                ]
            ];

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $secretKey,
                'Content-Type' => 'application/x-www-form-urlencoded'
            ])->asForm()->post('https://api.stripe.com/v1/checkout/sessions', $sessionData);

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'payment_id' => $data['id'],
                    'checkout_url' => $data['url']
                ];
            } else {
                Log::error('Stripe error: ' . $response->body());
                return ['success' => false, 'error' => 'Error al procesar el pago'];
            }

        } catch (\Exception $e) {
            Log::error('Stripe exception: ' . $e->getMessage());
            return ['success' => false, 'error' => 'Error interno del servidor'];
        }
    }

    public function refundPayment(Payment $payment, float $amount, string $reason)
    {
        switch ($payment->payment_provider) {
            case 'mercadopago':
                return $this->refundMercadoPago($payment, $amount, $reason);
            case 'stripe':
                return $this->refundStripe($payment, $amount, $reason);
            default:
                return ['success' => false, 'error' => 'Proveedor de pago no soportado'];
        }
    }

    private function refundMercadoPago(Payment $payment, float $amount, string $reason)
    {
        return ['success' => true];
    }

    private function refundStripe(Payment $payment, float $amount, string $reason)
    {
        return ['success' => true];
    }

    public function handleWebhook(string $provider, array $data)
    {
        switch ($provider) {
            case 'mercadopago':
                return $this->handleMercadoPagoWebhook($data);
            case 'stripe':
                return $this->handleStripeWebhook($data);
            default:
                return ['success' => false, 'error' => 'Proveedor desconocido'];
        }
    }

    private function handleMercadoPagoWebhook(array $data)
    {
        try {
            Log::info('MercadoPago webhook received', $data);
            
            // MercadoPago puede enviar diferentes tipos de notificaciones
            if (isset($data['type'])) {
                switch ($data['type']) {
                    case 'payment':
                        return $this->handleMercadoPagoPayment($data);
                    case 'preference':
                        return $this->handleMercadoPagoPreference($data);
                    default:
                        Log::info('MercadoPago webhook type not handled', ['type' => $data['type']]);
                        return ['success' => true];
                }
            }
            
            // También puede recibir datos directamente del pago
            if (isset($data['data']['id'])) {
                return $this->handleMercadoPagoPayment($data);
            }
            
            return ['success' => true];
        } catch (\Exception $e) {
            Log::error('MercadoPago webhook error: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    private function handleMercadoPagoPayment(array $data)
    {
        $paymentId = $data['data']['id'] ?? $data['id'];
        
        if (!$paymentId) {
            Log::error('MercadoPago webhook: No payment ID found');
            return ['success' => false, 'error' => 'No payment ID found'];
        }
        
        $accessToken = config('services.mercadopago.access_token');
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $accessToken
        ])->get("https://api.mercadopago.com/v1/payments/{$paymentId}");

        if ($response->successful()) {
            $paymentData = $response->json();
            Log::info('MercadoPago payment data', $paymentData);
            
            $externalReference = $paymentData['external_reference'];
            
            if (!$externalReference) {
                Log::error('MercadoPago webhook: No external reference found');
                return ['success' => false, 'error' => 'No external reference found'];
            }
            
            $payment = Payment::find($externalReference);
            
            if (!$payment) {
                Log::error('MercadoPago webhook: Payment not found', ['external_reference' => $externalReference]);
                return ['success' => false, 'error' => 'Payment not found'];
            }
            
            $status = $paymentData['status'];
            Log::info('MercadoPago payment status', ['payment_id' => $payment->id, 'status' => $status]);
            
            switch ($status) {
                case 'approved':
                    $payment->update([
                        'status' => 'completed',
                        'paid_at' => now(),
                        'provider_payment_id' => $paymentId
                    ]);
                    
                    $payment->appointment->update([
                        'deposit_paid' => true,
                        'deposit_paid_at' => now(),
                        'status' => 'confirmed'
                    ]);
                    
                    // Enviar notificación de confirmación
                    try {
                        app(NotificationService::class)->sendPaymentConfirmation($payment);
                    } catch (\Exception $e) {
                        Log::error('Error sending payment confirmation: ' . $e->getMessage());
                    }
                    
                    Log::info('MercadoPago payment completed', ['payment_id' => $payment->id]);
                    break;
                    
                case 'rejected':
                    $payment->update([
                        'status' => 'failed',
                        'provider_payment_id' => $paymentId
                    ]);
                    Log::info('MercadoPago payment rejected', ['payment_id' => $payment->id]);
                    break;
                    
                case 'pending':
                    $payment->update([
                        'status' => 'processing',
                        'provider_payment_id' => $paymentId
                    ]);
                    Log::info('MercadoPago payment pending', ['payment_id' => $payment->id]);
                    break;
                    
                default:
                    Log::info('MercadoPago payment status not handled', ['status' => $status]);
            }
            
            return ['success' => true];
        } else {
            Log::error('MercadoPago API error', ['response' => $response->body()]);
            return ['success' => false, 'error' => 'API error'];
        }
    }

    private function handleMercadoPagoPreference(array $data)
    {
        Log::info('MercadoPago preference webhook received', $data);
        return ['success' => true];
    }

    private function handleStripeWebhook(array $data)
    {
        return ['success' => true];
    }
}