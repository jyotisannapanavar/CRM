<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Opportunity;
use App\Models\OpportunityLostReason;
use App\Models\Status;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OpportunityController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Opportunity::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('party_name', 'like', "%{$search}%")
                  ->orWhere('company_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status_id')) {
            $query->where('status_id', $request->status_id);
        }

        if ($request->filled('opportunity_type_id')) {
            $query->where('opportunity_type_id', $request->opportunity_type_id);
        }

        if ($request->filled('opportunity_stage_id')) {
            $query->where('opportunity_stage_id', $request->opportunity_stage_id);
        }

        $opportunities = $query->orderBy('created_at', 'desc')
                               ->paginate($request->per_page ?? 15);

        return response()->json($opportunities);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'naming_series' => 'nullable|string|max:255',
            'opportunity_type_id' => 'nullable|integer|exists:opportunity_types,id',
            'opportunity_stage_id' => 'nullable|integer|exists:opportunity_stages,id',
            'opportunity_from' => 'nullable|string|in:lead,customer,prospect',
            'lead_id' => 'nullable|integer|exists:leads,id',
            'customer_id' => 'nullable|integer|exists:customers,id',
            'customer_contact_id' => 'nullable|integer|exists:customer_contacts,id',
            'prospect_id' => 'nullable|integer|exists:prospects,id',
            'source_id' => 'nullable|integer|exists:sources,id',
            'expected_closing' => 'nullable|date',
            'party_name' => 'nullable|string|max:255',
            'opportunity_owner' => 'nullable|integer|exists:users,id',
            'probability' => 'nullable|numeric|min:0|max:100',
            'status_id' => 'nullable|integer|exists:statuses,id',
            'company_name' => 'nullable|string|max:255',
            'industry_id' => 'nullable|integer|exists:industry_types,id',
            'no_of_employees' => 'nullable|string|max:50',
            'city' => 'nullable|string|max:255',
            'state' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            'annual_revenue' => 'nullable|numeric|min:0',
            'market_segment' => 'nullable|string|max:255',
            'currency' => 'nullable|string|max:10',
            'opportunity_amount' => 'nullable|numeric|min:0',
            'items' => 'nullable|array',
            'items.*.item_code' => 'required_with:items|string|max:255',
            'items.*.item_name' => 'nullable|string|max:255',
            'items.*.qty' => 'required_with:items|numeric|min:0',
            'items.*.rate' => 'required_with:items|numeric|min:0',
            'items.*.amount' => 'required_with:items|numeric|min:0',
            'contact_person' => 'nullable|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'contact_mobile' => 'nullable|string|max:20',
            'territory_id' => 'nullable|integer|exists:territories,id',
            'next_contact_by' => 'nullable|string|max:255',
            'next_contact_date' => 'nullable|date',
            'to_discuss' => 'nullable|string',
            'with_items' => 'boolean',
            'opportunity_lost_reasons' => 'nullable|string|max:255',
        ]);

        $opportunityData = collect($validated)->except(['items', 'opportunity_lost_reasons'])->toArray();
        $opportunity = Opportunity::create($opportunityData);

        if (!empty($validated['items'])) {
            $opportunity->items()->createMany($validated['items']);
        }

        // Save lost reason if status is "Lost"
        if (!empty($validated['opportunity_lost_reasons']) && !empty($validated['status_id'])) {
            $status = Status::find($validated['status_id']);
            if ($status && strtolower($status->status_name) === 'lost') {
                OpportunityLostReason::create([
                    'opportunity_id' => $opportunity->id,
                    'opportunity_lost_reasons' => $validated['opportunity_lost_reasons'],
                ]);
            }
        }

        return response()->json($opportunity->fresh('items', 'lostReasons'), 201);
    }

    public function show(int $id): JsonResponse
    {
        $opportunity = Opportunity::with('items')->findOrFail($id);
        return response()->json($opportunity);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'naming_series' => 'nullable|string|max:255',
            'opportunity_type_id' => 'nullable|integer|exists:opportunity_types,id',
            'opportunity_stage_id' => 'nullable|integer|exists:opportunity_stages,id',
            'opportunity_from' => 'nullable|string|in:lead,customer,prospect',
            'lead_id' => 'nullable|integer|exists:leads,id',
            'customer_id' => 'nullable|integer|exists:customers,id',
            'customer_contact_id' => 'nullable|integer|exists:customer_contacts,id',
            'prospect_id' => 'nullable|integer|exists:prospects,id',
            'source_id' => 'nullable|integer|exists:sources,id',
            'expected_closing' => 'nullable|date',
            'party_name' => 'nullable|string|max:255',
            'opportunity_owner' => 'nullable|integer|exists:users,id',
            'probability' => 'nullable|numeric|min:0|max:100',
            'status_id' => 'nullable|integer|exists:statuses,id',
            'company_name' => 'nullable|string|max:255',
            'industry_id' => 'nullable|integer|exists:industry_types,id',
            'no_of_employees' => 'nullable|string|max:50',
            'city' => 'nullable|string|max:255',
            'state' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            'annual_revenue' => 'nullable|numeric|min:0',
            'market_segment' => 'nullable|string|max:255',
            'currency' => 'nullable|string|max:10',
            'opportunity_amount' => 'nullable|numeric|min:0',
            'items' => 'nullable|array',
            'items.*.item_code' => 'required_with:items|string|max:255',
            'items.*.item_name' => 'nullable|string|max:255',
            'items.*.qty' => 'required_with:items|numeric|min:0',
            'items.*.rate' => 'required_with:items|numeric|min:0',
            'items.*.amount' => 'required_with:items|numeric|min:0',
            'contact_person' => 'nullable|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'contact_mobile' => 'nullable|string|max:20',
            'territory_id' => 'nullable|integer|exists:territories,id',
            'next_contact_by' => 'nullable|string|max:255',
            'next_contact_date' => 'nullable|date',
            'to_discuss' => 'nullable|string',
            'with_items' => 'boolean',
            'opportunity_lost_reasons' => 'nullable|string|max:255',
        ]);

        $opportunity = Opportunity::findOrFail($id);
        $opportunityData = collect($validated)->except(['items', 'opportunity_lost_reasons'])->toArray();
        $opportunity->update($opportunityData);

        if (array_key_exists('items', $validated)) {
            $opportunity->items()->delete();
            if (!empty($validated['items'])) {
                $opportunity->items()->createMany($validated['items']);
            }
        }

        // Save lost reason if status is "Lost"
        if (!empty($validated['opportunity_lost_reasons']) && !empty($validated['status_id'])) {
            $status = Status::find($validated['status_id']);
            if ($status && strtolower($status->status_name) === 'lost') {
                OpportunityLostReason::create([
                    'opportunity_id' => $opportunity->id,
                    'opportunity_lost_reasons' => $validated['opportunity_lost_reasons'],
                ]);
            }
        }

        return response()->json($opportunity->fresh('items', 'lostReasons'));
    }

    public function destroy(int $id): JsonResponse
    {
        $opportunity = Opportunity::findOrFail($id);
        $opportunity->delete();
        return response()->json(null, 204);
    }

    public function declareLost(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'lost_reason_ids' => 'required|array',
            'lost_reason_ids.*' => 'integer|exists:opportunity_lost_reasons,id',
            'competitor_ids' => 'nullable|array',
            'competitor_ids.*' => 'integer|exists:competitors,id',
            'detailed_reason' => 'nullable|string',
        ]);

        $opportunity = Opportunity::findOrFail($id);
        $opportunity->lostReasons()->sync($validated['lost_reason_ids']);
        
        if (!empty($validated['competitor_ids'])) {
            $opportunity->competitors()->sync($validated['competitor_ids']);
        }
        
        return response()->json($opportunity->fresh());
    }

    public function setMultipleStatus(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:opportunities,id',
            'status_id' => 'required|integer|exists:statuses,id',
        ]);

        $count = Opportunity::whereIn('id', $validated['ids'])
                            ->update(['status_id' => $validated['status_id']]);
        return response()->json(['updated' => $count]);
    }
}
