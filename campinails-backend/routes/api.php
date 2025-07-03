<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\TimeSlotController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PromotionController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\DashboardController;

Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);

// Rutas públicas para solicitud de turno
Route::get('/services/public', [ServiceController::class, 'publicIndex']);
Route::get('/time-slots/available-days', [TimeSlotController::class, 'getAvailableDays']);
Route::get('/employees/public', [EmployeeController::class, 'publicIndex']);
Route::get('/time-slots/available', [TimeSlotController::class, 'getAvailableSlots']);
Route::post('/appointments', [AppointmentController::class, 'store']);

// Rutas públicas para promociones
Route::get('/promotions/active', [PromotionController::class, 'getActive']);
Route::post('/promotions/validate', [PromotionController::class, 'validate']);

// Webhook para pagos (sin autenticación)
Route::post('/payments/webhook', [PaymentController::class, 'webhook']);

// Rutas protegidas solo para admin
Route::middleware('auth:sanctum')->group(function () {
    // Dashboard y estadísticas
    Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);
    Route::get('/dashboard/upcoming-appointments', [DashboardController::class, 'getUpcomingAppointments']);
    Route::get('/dashboard/recent-activity', [DashboardController::class, 'getRecentActivity']);
    
    // CRUD básico
    Route::apiResource('services', ServiceController::class);
    Route::apiResource('clients', ClientController::class);
    Route::apiResource('appointments', AppointmentController::class)->except(['store']);
    Route::apiResource('time-slots', TimeSlotController::class);
    Route::apiResource('employees', EmployeeController::class);
    Route::apiResource('notifications', NotificationController::class);
    Route::apiResource('payments', PaymentController::class);
    Route::apiResource('promotions', PromotionController::class);
    Route::apiResource('products', ProductController::class);
    
    // Rutas adicionales para TimeSlots
    Route::post('/time-slots/bulk', [TimeSlotController::class, 'createBulk']);
    Route::patch('/time-slots/{id}/toggle-block', [TimeSlotController::class, 'toggleBlock']);
    
    // Rutas adicionales para Employees
    Route::get('/employees/{id}/schedule', [EmployeeController::class, 'getSchedule']);
    Route::post('/employees/{id}/slots', [EmployeeController::class, 'createSlots']);
    
    // Rutas adicionales para Notifications
    Route::patch('/notifications/{id}/mark-as-read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/{id}/resend', [NotificationController::class, 'resend']);
    Route::post('/notifications/bulk', [NotificationController::class, 'sendBulk']);
    
    // Rutas adicionales para Payments
    Route::post('/payments/{id}/confirm', [PaymentController::class, 'confirm']);
    Route::post('/payments/{id}/refund', [PaymentController::class, 'refund']);
    
    // Rutas adicionales para Products
    Route::post('/products/{id}/adjust-stock', [ProductController::class, 'adjustStock']);
    Route::get('/products/low-stock', [ProductController::class, 'getLowStock']);
    Route::get('/products/categories', [ProductController::class, 'getCategories']);
    Route::get('/products/stock-report', [ProductController::class, 'getStockReport']);
});