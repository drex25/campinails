<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\TimeSlotController;

Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);

// Rutas públicas para solicitud de turno
Route::get('/services/public', [ServiceController::class, 'publicIndex']);
Route::get('/time-slots/available', [TimeSlotController::class, 'getAvailableSlots']);
Route::post('appointments', [AppointmentController::class, 'store']);

// Rutas protegidas solo para admin
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('services', ServiceController::class);
    Route::apiResource('clients', ClientController::class);
    Route::apiResource('appointments', AppointmentController::class)->except(['store']);
    Route::apiResource('time-slots', TimeSlotController::class);
    
    // Rutas adicionales para TimeSlots
    Route::post('/time-slots/bulk', [TimeSlotController::class, 'createBulk']);
    Route::patch('/time-slots/{id}/toggle-block', [TimeSlotController::class, 'toggleBlock']);
}); 