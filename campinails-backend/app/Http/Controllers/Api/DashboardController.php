<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Appointment;
use App\Models\Client;
use App\Models\Service;
use App\Models\Payment;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function getStats(Request $request)
    {
        $period = $request->get('period', 'month');
        $startDate = $this->getStartDate($period);
        $endDate = now();

        $stats = [
            'appointments' => $this->getAppointmentStats($startDate, $endDate),
            'revenue' => $this->getRevenueStats($startDate, $endDate),
            'clients' => $this->getClientStats($startDate, $endDate),
            'services' => $this->getServiceStats($startDate, $endDate),
            'inventory' => $this->getInventoryStats(),
            'trends' => $this->getTrends($period)
        ];

        return response()->json($stats);
    }

    public function getAppointmentStats($startDate, $endDate)
    {
        $total = Appointment::whereBetween('created_at', [$startDate, $endDate])->count();
        $confirmed = Appointment::whereBetween('created_at', [$startDate, $endDate])
                                ->where('status', 'confirmed')->count();
        $completed = Appointment::whereBetween('created_at', [$startDate, $endDate])
                                ->where('status', 'completed')->count();
        $cancelled = Appointment::whereBetween('created_at', [$startDate, $endDate])
                                ->where('status', 'cancelled')->count();
        $noShow = Appointment::whereBetween('created_at', [$startDate, $endDate])
                             ->where('status', 'no_show')->count();

        $today = Appointment::whereDate('scheduled_at', today())
                           ->where('status', '!=', 'cancelled')
                           ->count();

        $upcoming = Appointment::whereBetween('scheduled_at', [now(), now()->addDays(7)])
                              ->where('status', '!=', 'cancelled')
                              ->count();

        return [
            'total' => $total,
            'confirmed' => $confirmed,
            'completed' => $completed,
            'cancelled' => $cancelled,
            'no_show' => $noShow,
            'today' => $today,
            'upcoming' => $upcoming,
            'completion_rate' => $total > 0 ? round(($completed / $total) * 100, 2) : 0,
            'cancellation_rate' => $total > 0 ? round((($cancelled + $noShow) / $total) * 100, 2) : 0
        ];
    }

    public function getRevenueStats($startDate, $endDate)
    {
        $totalRevenue = Payment::where('status', 'completed')
                              ->whereBetween('created_at', [$startDate, $endDate])
                              ->sum('amount');

        $depositRevenue = Payment::where('status', 'completed')
                                ->whereBetween('created_at', [$startDate, $endDate])
                                ->whereHas('appointment', function($q) {
                                    $q->where('deposit_paid', true);
                                })
                                ->sum('amount');

        $pendingRevenue = Appointment::where('status', 'confirmed')
                                   ->where('deposit_paid', false)
                                   ->sum('deposit_amount');

        $revenueByMethod = Payment::where('status', 'completed')
                                 ->whereBetween('created_at', [$startDate, $endDate])
                                 ->select('payment_method', DB::raw('SUM(amount) as total'))
                                 ->groupBy('payment_method')
                                 ->get();

        $avgRevenuePerAppointment = Appointment::where('status', 'completed')
                                             ->whereBetween('created_at', [$startDate, $endDate])
                                             ->avg('total_price');

        return [
            'total_revenue' => $totalRevenue,
            'deposit_revenue' => $depositRevenue,
            'pending_revenue' => $pendingRevenue,
            'revenue_by_method' => $revenueByMethod,
            'avg_revenue_per_appointment' => round($avgRevenuePerAppointment, 2)
        ];
    }

    public function getClientStats($startDate, $endDate)
    {
        $totalClients = Client::count();
        $newClients = Client::whereBetween('created_at', [$startDate, $endDate])->count();
        $activeClients = Client::whereHas('appointments', function($q) use ($startDate, $endDate) {
            $q->whereBetween('created_at', [$startDate, $endDate]);
        })->count();

        $frequentClients = Client::withCount(['appointments' => function($q) use ($startDate, $endDate) {
            $q->whereBetween('created_at', [$startDate, $endDate]);
        }])->having('appointments_count', '>', 3)->count();

        $returningClients = Client::whereHas('appointments', function($q) use ($startDate) {
            $q->where('created_at', '<', $startDate);
        })->whereHas('appointments', function($q) use ($startDate, $endDate) {
            $q->whereBetween('created_at', [$startDate, $endDate]);
        })->count();

        $retentionRate = $totalClients > 0 ? round(($returningClients / $totalClients) * 100, 2) : 0;

        return [
            'total_clients' => $totalClients,
            'new_clients' => $newClients,
            'active_clients' => $activeClients,
            'frequent_clients' => $frequentClients,
            'retention_rate' => $retentionRate
        ];
    }

    public function getServiceStats($startDate, $endDate)
    {
        $popularServices = Appointment::with('service')
                                    ->whereBetween('created_at', [$startDate, $endDate])
                                    ->select('service_id', DB::raw('COUNT(*) as count'))
                                    ->groupBy('service_id')
                                    ->orderBy('count', 'desc')
                                    ->limit(5)
                                    ->get();

        $revenueByService = Appointment::with('service')
                                     ->whereBetween('created_at', [$startDate, $endDate])
                                     ->where('status', 'completed')
                                     ->select('service_id', DB::raw('SUM(total_price) as revenue'))
                                     ->groupBy('service_id')
                                     ->orderBy('revenue', 'desc')
                                     ->get();

        return [
            'popular_services' => $popularServices,
            'revenue_by_service' => $revenueByService
        ];
    }

    public function getInventoryStats()
    {
        $totalProducts = Product::where('is_active', true)->count();
        $lowStockProducts = Product::where('is_active', true)
                                  ->whereColumn('stock_quantity', '<=', 'min_stock_level')
                                  ->count();
        $outOfStockProducts = Product::where('stock_quantity', 0)
                                   ->where('is_active', true)
                                   ->count();
        $totalInventoryValue = Product::where('is_active', true)
                                    ->sum(DB::raw('stock_quantity * cost_price'));

        return [
            'total_products' => $totalProducts,
            'low_stock_products' => $lowStockProducts,
            'out_of_stock_products' => $outOfStockProducts,
            'total_inventory_value' => $totalInventoryValue
        ];
    }

    public function getTrends($period)
    {
        $days = $this->getDaysForPeriod($period);
        $trends = [];

        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $startOfDay = $date->copy()->startOfDay();
            $endOfDay = $date->copy()->endOfDay();

            $appointments = Appointment::whereBetween('created_at', [$startOfDay, $endOfDay])->count();
            $revenue = Payment::where('status', 'completed')
                             ->whereBetween('created_at', [$startOfDay, $endOfDay])
                             ->sum('amount');

            $trends[] = [
                'date' => $date->format('Y-m-d'),
                'appointments' => $appointments,
                'revenue' => $revenue
            ];
        }

        return $trends;
    }

    public function getUpcomingAppointments()
    {
        $appointments = Appointment::with(['client', 'service', 'employee'])
                                  ->where('scheduled_at', '>=', now())
                                  ->where('scheduled_at', '<=', now()->addDays(7))
                                  ->where('status', '!=', 'cancelled')
                                  ->orderBy('scheduled_at')
                                  ->limit(10)
                                  ->get();

        return response()->json($appointments);
    }

    public function getRecentActivity()
    {
        $recentAppointments = Appointment::with(['client', 'service'])
                                        ->orderBy('created_at', 'desc')
                                        ->limit(5)
                                        ->get();

        $recentPayments = Payment::with(['appointment.client'])
                                ->orderBy('created_at', 'desc')
                                ->limit(5)
                                ->get();

        return response()->json([
            'appointments' => $recentAppointments,
            'payments' => $recentPayments
        ]);
    }

    private function getStartDate($period)
    {
        switch ($period) {
            case 'day':
                return now()->startOfDay();
            case 'week':
                return now()->startOfWeek();
            case 'month':
                return now()->startOfMonth();
            case 'year':
                return now()->startOfYear();
            default:
                return now()->startOfMonth();
        }
    }

    private function getDaysForPeriod($period)
    {
        switch ($period) {
            case 'day':
                return 1;
            case 'week':
                return 7;
            case 'month':
                return 30;
            case 'year':
                return 365;
            default:
                return 30;
        }
    }
}