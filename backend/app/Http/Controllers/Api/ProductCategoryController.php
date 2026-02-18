<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductCategoryController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(ProductCategory::all());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:product_categories',
            'description' => 'nullable|string',
        ]);

        $productCategory = ProductCategory::create($validated);
        return response()->json($productCategory, 201);
    }

    public function show(int $id): JsonResponse
    {
        return response()->json(ProductCategory::findOrFail($id));
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $productCategory = ProductCategory::findOrFail($id);
        $validated = $request->validate([
            'name' => 'nullable|string|max:255|unique:product_categories,name,' . $id,
            'description' => 'nullable|string',
        ]);
        $productCategory->update($validated);
        return response()->json($productCategory);
    }

    public function destroy(int $id): JsonResponse
    {
        ProductCategory::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
