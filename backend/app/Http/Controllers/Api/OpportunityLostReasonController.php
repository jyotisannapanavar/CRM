<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OpportunityLostReason;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OpportunityLostReasonController extends Controller
{
    public function index(): JsonResponse
    {
        $reasons = OpportunityLostReason::with('opportunity')->get();
        return response()->json($reasons);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'opportunity_id' => 'required|exists:opportunities,id',
            'opportunity_lost_reasons' => 'required|string|max:255',
        ]);

        $reason = OpportunityLostReason::create($validated);
        return response()->json($reason->load('opportunity'), 201);
    }

    public function show(int $id): JsonResponse
    {
        $reason = OpportunityLostReason::with('opportunity')->findOrFail($id);
        return response()->json($reason);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $reason = OpportunityLostReason::findOrFail($id);

        $validated = $request->validate([
            'opportunity_id' => 'sometimes|required|exists:opportunities,id',
            'opportunity_lost_reasons' => 'sometimes|required|string|max:255',
        ]);

        $reason->update($validated);
        return response()->json($reason->load('opportunity'));
    }

    public function destroy(int $id): JsonResponse
    {
        OpportunityLostReason::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
