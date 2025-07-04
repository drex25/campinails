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
                'external_reference' => $payment->id,
                'back_urls' => [
                    'success' => 'https://httpbin.org/status/200',
                    'failure' => 'https://httpbin.org/status/400',
                    'pending' => 'https://httpbin.org/status/200'
                ],
                'auto_return' => 'approved'
            ];

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
            if (isset($data['type']) && $data['type'] === 'payment') {
                $paymentId = $data['data']['id'];
                
                $accessToken = config('services.mercadopago.access_token');
                $response = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $accessToken
                ])->get("https://api.mercadopago.com/v1/payments/{$paymentId}");

                if ($response->successful()) {
                    $paymentData = $response->json();
                    $externalReference = $paymentData['external_reference'];
                    
                    $payment = Payment::find($externalReference);
                    
                    if ($payment) {
                        if ($paymentData['status'] === 'approved') {
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
                            
                            app(NotificationService::class)->sendPaymentConfirmation($payment);
                        }
                    }
                }
            }
            
            return ['success' => true];
        } catch (\Exception $e) {
            Log::error('MercadoPago webhook error: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    private function handleStripeWebhook(array $data)
    {
        return ['success' => true];
    }
}