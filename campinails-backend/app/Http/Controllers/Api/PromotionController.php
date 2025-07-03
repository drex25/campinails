<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Promotion;
use App\Models\Service;
use Carbon\Carbon;

class PromotionController extends Controller
{
    public function index(Request $request)
    {
        $query = Promotion::with('services');

        if ($request->has('active')) {
            if ($request->boolean('active')) {
                $query->active();
            } else {
                $query->where('is_active', false);
            }
        }

        if ($request->has('code')) {
            $query->byCode($request->code);
        }

        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'code' => 'required|string|unique:promotions,code',
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|min:0',
            'min_amount' => 'nullable|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
            'starts_at' => 'required|date',
            'expires_at' => 'required|date|after:starts_at',
            'applicable_days' => 'nullable|array',
            'applicable_days.*' => 'integer|between:0,6',
            'applicable_services' => 'nullable|array',
            'applicable_services.*' => 'exists:services,id'
        ]);

        $promotion = Promotion::create($validated);

        if (isset($validated['applicable_services'])) {
            $promotion->services()->attach($validated['applicable_services']);
        }

        return response()->json($promotion->load('services'), 201);
    }

    public function show(string $id)
    {
        $promotion = Promotion::with('services')->findOrFail($id);
        return response()->json($promotion);
    }

    public function update(Request $request, string $id)
    {
        $promotion = Promotion::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'code' => 'sometimes|string|unique:promotions,code,' . $id,
            'type' => 'sometimes|in:percentage,fixed',
            'value' => 'sometimes|numeric|min:0',
            'min_amount' => 'nullable|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
            'starts_at' => 'sometimes|date',
            'expires_at' => 'sometimes|date|after:starts_at',
            'applicable_days' => 'nullable|array',
            'applicable_days.*' => 'integer|between:0,6',
            'applicable_services' => 'nullable|array',
            'applicable_services.*' => 'exists:services,id'
        ]);

        $promotion->update($validated);

        if (isset($validated['applicable_services'])) {
            $promotion->services()->sync($validated['applicable_services']);
        }

        return response()->json($promotion->load('services'));
    }

    public function destroy(string $id)
    {
        $promotion = Promotion::findOrFail($id);
        $promotion->delete();
        
        return response()->json(['message' => 'Promoción eliminada']);
    }

    public function validate(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string',
            'service_id' => 'required|exists:services,id',
            'date' => 'required|date',
            'amount' => 'required|numeric|min:0'
        ]);

        $promotion = Promotion::active()->byCode($validated['code'])->first();
        
        if (!$promotion) {
            return response()->json(['message' => 'Código de promoción inválido o expirado'], 422);
        }

        $service = Service::findOrFail($validated['service_id']);
        $date = Carbon::parse($validated['date']);

        if (!$promotion->canBeAppliedTo($service, $date)) {
            return response()->json(['message' => 'Esta promoción no es aplicable a este servicio o fecha'], 422);
        }

        $discount = $promotion->calculateDiscount($validated['amount']);
        
        return response()->json([
            'valid' => true,
            'promotion' => $promotion,
            'discount_amount' => $discount,
            'final_amount' => $validated['amount'] - $discount
        ]);
    }

    public function getActive()
    {
        $promotions = Promotion::active()->with('services')->get();
        return response()->json($promotions);
    }
}