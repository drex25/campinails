<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::query();

        if ($request->has('category')) {
            $query->byCategory($request->category);
        }

        if ($request->has('active')) {
            $query->where('is_active', $request->boolean('active'));
        }

        if ($request->has('low_stock')) {
            if ($request->boolean('low_stock')) {
                $query->lowStock();
            }
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('brand', 'like', "%{$search}%");
            });
        }

        return response()->json($query->orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'sku' => 'required|string|unique:products,sku',
            'category' => 'required|string',
            'brand' => 'nullable|string',
            'cost_price' => 'required|numeric|min:0',
            'selling_price' => 'nullable|numeric|min:0',
            'stock_quantity' => 'integer|min:0',
            'min_stock_level' => 'integer|min:0',
            'max_stock_level' => 'nullable|integer|min:0',
            'unit' => 'string',
            'is_active' => 'boolean',
            'notes' => 'nullable|string'
        ]);

        $product = Product::create($validated);
        return response()->json($product, 201);
    }

    public function show(string $id)
    {
        $product = Product::with('stockMovements.user')->findOrFail($id);
        return response()->json($product);
    }

    public function update(Request $request, string $id)
    {
        $product = Product::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'sku' => 'sometimes|string|unique:products,sku,' . $id,
            'category' => 'sometimes|string',
            'brand' => 'nullable|string',
            'cost_price' => 'sometimes|numeric|min:0',
            'selling_price' => 'nullable|numeric|min:0',
            'min_stock_level' => 'sometimes|integer|min:0',
            'max_stock_level' => 'nullable|integer|min:0',
            'unit' => 'sometimes|string',
            'is_active' => 'boolean',
            'notes' => 'nullable|string'
        ]);

        $product->update($validated);
        return response()->json($product);
    }

    public function destroy(string $id)
    {
        $product = Product::findOrFail($id);
        $product->delete();
        
        return response()->json(['message' => 'Producto eliminado']);
    }

    public function adjustStock(Request $request, string $id)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer',
            'reason' => 'required|string',
            'notes' => 'nullable|string'
        ]);

        $product = Product::findOrFail($id);
        $user = auth()->user();

        if ($validated['quantity'] > 0) {
            $product->addStock($validated['quantity'], $validated['reason'], $user->id);
        } elseif ($validated['quantity'] < 0) {
            $product->removeStock(abs($validated['quantity']), $validated['reason'], $user->id);
        }

        return response()->json([
            'message' => 'Stock ajustado exitosamente',
            'new_stock' => $product->fresh()->stock_quantity
        ]);
    }

    public function getLowStock()
    {
        $products = Product::lowStock()->active()->get();
        return response()->json($products);
    }

    public function getCategories()
    {
        $categories = Product::distinct()->pluck('category')->filter()->values();
        return response()->json($categories);
    }

    public function getStockReport(Request $request)
    {
        $query = Product::with('stockMovements');

        if ($request->has('category')) {
            $query->byCategory($request->category);
        }

        $products = $query->get();

        $report = $products->map(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'category' => $product->category,
                'current_stock' => $product->stock_quantity,
                'min_stock_level' => $product->min_stock_level,
                'is_low_stock' => $product->isLowStock(),
                'is_out_of_stock' => $product->isOutOfStock(),
                'total_value' => $product->stock_quantity * $product->cost_price,
                'last_movement' => $product->stockMovements->first()?->created_at
            ];
        });

        return response()->json($report);
    }
}