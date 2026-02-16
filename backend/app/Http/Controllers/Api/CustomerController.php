<?php

namespace App\Http\Controllers\Api;

use App\Enums\CustomerType;
use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rules\Enum;

class CustomerController extends Controller
{
    public function index(): JsonResponse
    {
        $customers = Customer::with([
            'customerGroup',
            'territory',
            'lead',
            'opportunity',
            'industry',
            'priceList',
            'paymentTerm',
            'primaryContact'
        ])->latest()->paginate(10);

        return response()->json($customers);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'customer_type' => ['nullable', new Enum(CustomerType::class)],
            'customer_group_id' => 'nullable|exists:customer_groups,id',
            'territory_id' => 'nullable|exists:territories,id',
            'lead_id' => 'nullable|exists:leads,id',
            'opportunity_id' => 'nullable|exists:opportunities,id',
            'industry_id' => 'nullable|exists:industry_types,id',
            'default_price_list_id' => 'nullable|exists:price_lists,id',
            'payment_term_id' => 'nullable|exists:payment_terms,id',
            'customer_contact_id' => 'nullable|exists:customer_contacts,id',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'website' => 'nullable|url',
            'tax_id' => 'nullable|string',
            'billing_currency' => 'nullable|string',
            'bank_account_details' => 'nullable|string',
            'print_language' => 'nullable|string',
            'customer_details' => 'nullable|string',
        ]);

        $customer = Customer::create($validated);

        $customer->load([
            'customerGroup',
            'territory',
            'lead',
            'opportunity',
            'industry',
            'priceList',
            'paymentTerm',
            'primaryContact'
        ]);

        return response()->json($customer, 201);
    }

    public function show(Customer $customer): JsonResponse
    {
        $customer->load([
            'customerGroup',
            'territory',
            'lead',
            'opportunity',
            'industry',
            'priceList',
            'paymentTerm',
            'primaryContact'
        ]);

        return response()->json($customer);
    }

    public function update(Request $request, Customer $customer): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'customer_type' => ['nullable', new Enum(CustomerType::class)],
            'customer_group_id' => 'nullable|exists:customer_groups,id',
            'territory_id' => 'nullable|exists:territories,id',
            'lead_id' => 'nullable|exists:leads,id',
            'opportunity_id' => 'nullable|exists:opportunities,id',
            'industry_id' => 'nullable|exists:industry_types,id',
            'default_price_list_id' => 'nullable|exists:price_lists,id',
            'payment_term_id' => 'nullable|exists:payment_terms,id',
            'customer_contact_id' => 'nullable|exists:customer_contacts,id',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'website' => 'nullable|url',
            'tax_id' => 'nullable|string',
            'billing_currency' => 'nullable|string',
            'bank_account_details' => 'nullable|string',
            'print_language' => 'nullable|string',
            'customer_details' => 'nullable|string',
        ]);

        $customer->update($validated);

        $customer->load([
            'customerGroup',
            'territory',
            'lead',
            'opportunity',
            'industry',
            'priceList',
            'paymentTerm',
            'primaryContact'
        ]);

        return response()->json($customer);
    }

    public function destroy(Customer $customer): JsonResponse
    {
        $customer->delete();
        return response()->json(null, 204);
    }
}
