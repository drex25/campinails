<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    // Servicios de pago
    'mercadopago' => [
        'access_token' => env('MERCADOPAGO_ACCESS_TOKEN'),
        'public_key' => env('MERCADOPAGO_PUBLIC_KEY'),
        'client_id' => env('MERCADOPAGO_CLIENT_ID'),
        'client_secret' => env('MERCADOPAGO_CLIENT_SECRET'),
        'sandbox' => env('MERCADOPAGO_SANDBOX', true),
    ],

    'stripe' => [
        'public' => env('STRIPE_PUBLIC_KEY'),
        'secret' => env('STRIPE_SECRET_KEY'),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
    ],

    // Servicios de notificaciones
    'twilio' => [
        'sid' => env('TWILIO_SID'),
        'token' => env('TWILIO_TOKEN'),
        'phone_number' => env('TWILIO_PHONE_NUMBER'),
        'whatsapp_number' => env('TWILIO_WHATSAPP_NUMBER'),
    ],

    'firebase' => [
        'server_key' => env('FIREBASE_SERVER_KEY'),
        'sender_id' => env('FIREBASE_SENDER_ID'),
    ],

];