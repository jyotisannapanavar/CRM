<?php

namespace App\Http\Controllers\Api;

use App\Enums\Gender;
use App\Enums\QualificationStatus;
use App\Http\Controllers\Controller;
use App\Models\Lead;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeadController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Lead::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('company_name', 'like', "%{$search}%")
                    ->orWhere('mobile_no', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status_id')) {
            $query->where('status_id', $request->status_id);
        }

        if ($request->filled('source_id')) {
            $query->where('source_id', $request->source_id);
        }

        if ($request->filled('industry_id')) {
            $query->where('industry_id', $request->industry_id);
        }

        $leads = $query->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 15);

        return response()->json($leads);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'series' => 'nullable|string|max:255',
            'salutation' => 'nullable|string|max:50',
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'job_title' => 'nullable|string|max:255',
            'gender' => 'nullable|string|in:' . implode(',', Gender::values()),
            'status_id' => 'nullable|integer|exists:statuses,id',
            'source_id' => 'nullable|integer|exists:sources,id',
            'request_type_id' => 'nullable|integer|exists:request_types,id',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'mobile_no' => 'nullable|string|max:50',
            'website' => 'nullable|string|max:255',
            'whatsapp_no' => 'nullable|string|max:50',
            'city' => 'nullable|string|max:255',
            'state' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'annual_revenue' => 'nullable|numeric|min:0',
            'no_of_employees' => 'nullable|string|max:50',
            'industry_id' => 'nullable|integer|exists:industry_types,id',
            'qualification_status' => 'nullable|string|in:' . implode(',', QualificationStatus::values()),
            'qualified_by' => 'nullable|integer|exists:users,id',
            'qualified_on' => 'nullable|date',
        ]);

        $lead = Lead::create($validated);
        return response()->json($lead->fresh(), 201);
    }

    public function show(int $id): JsonResponse
    {
        $lead = Lead::findOrFail($id);
        return response()->json($lead);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'series' => 'nullable|string|max:255',
            'salutation' => 'nullable|string|max:50',
            'first_name' => 'nullable|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'job_title' => 'nullable|string|max:255',
            'gender' => 'nullable|string|in:' . implode(',', Gender::values()),
            'status_id' => 'nullable|integer|exists:statuses,id',
            'source_id' => 'nullable|integer|exists:sources,id',
            'request_type_id' => 'nullable|integer|exists:request_types,id',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'mobile_no' => 'nullable|string|max:50',
            'website' => 'nullable|string|max:255',
            'whatsapp_no' => 'nullable|string|max:50',
            'city' => 'nullable|string|max:255',
            'state' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'annual_revenue' => 'nullable|numeric|min:0',
            'no_of_employees' => 'nullable|string|max:50',
            'industry_id' => 'nullable|integer|exists:industry_types,id',
            'qualification_status' => 'nullable|string|in:' . implode(',', QualificationStatus::values()),
            'qualified_by' => 'nullable|integer|exists:users,id',
            'qualified_on' => 'nullable|date',
        ]);

        $lead = Lead::findOrFail($id);
        $lead->update($validated);
        return response()->json($lead->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $lead = Lead::findOrFail($id);
        $lead->delete();
        return response()->json(null, 204);
    }
}
