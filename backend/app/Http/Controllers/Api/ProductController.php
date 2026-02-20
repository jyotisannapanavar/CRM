<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(): JsonResponse
    {
        $products = Product::with('category')->get();
        return response()->json($products);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => 'nullable|integer|exists:product_categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'long_description' => 'nullable|string',
            'slug' => 'nullable|string|max:255|unique:products',
            'stock' => 'nullable|integer|min:0',
            'rate' => 'nullable|numeric|min:0',
            'amount' => 'nullable|numeric|min:0',
        ]);

        $product = Product::create($validated);
        $product->load('category');
        return response()->json($product, 201);
    }

    public function show(int $id): JsonResponse
    {
        $product = Product::with('category')->findOrFail($id);
        return response()->json($product);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $validated = $request->validate([
            'category_id' => 'nullable|integer|exists:product_categories,id',
            'name' => 'nullable|string|max:255',
            'code' => 'nullable|string|max:255|unique:products,code,' . $id,
            'description' => 'nullable|string',
            'long_description' => 'nullable|string',
            'slug' => 'nullable|string|max:255|unique:products,slug,' . $id,
            'stock' => 'nullable|integer|min:0',
            'rate' => 'nullable|numeric|min:0',
            'amount' => 'nullable|numeric|min:0',
        ]);
        $product->update($validated);
        $product->load('category');
        return response()->json($product);
    }

    public function destroy(int $id): JsonResponse
    {
        Product::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
