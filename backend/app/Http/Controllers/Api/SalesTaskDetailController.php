<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SalesTaskDetail;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class SalesTaskDetailController extends Controller
{
    public function index(Request $request)
    {
        $query = SalesTaskDetail::with(['salesTask.taskType', 'salesTask.taskSource', 'salesTask.assignedUser']);

        if ($request->has('sales_task_id')) {
            $query->where('sales_task_id', $request->sales_task_id);
        }

        return $query->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'sales_task_id' => 'nullable|exists:sales_tasks,id',
            'date' => 'required|date',
            'time' => 'required',
            'description' => 'nullable|string',
            'status' => 'required|in:Open,In Progress,Closed',
        ]);

        $salesTaskDetail = SalesTaskDetail::create($validated);

        return response()->json($salesTaskDetail, Response::HTTP_CREATED);
    }

    public function show($id)
    {
        return SalesTaskDetail::findOrFail($id);
    }

    public function update(Request $request, SalesTaskDetail $salesTaskDetail)
    {
        $validated = $request->validate([
            'sales_task_id' => 'nullable|exists:sales_tasks,id',
            'date' => 'date',
            'time' => 'string', // time validation can be tricky, relying on database or basic string format
            'description' => 'string',
            'status' => 'in:Open,In Progress,Closed',
        ]);

        $salesTaskDetail->update($validated);

        return response()->json($salesTaskDetail);
    }

    public function destroy(SalesTaskDetail $salesTaskDetail)
    {
        $salesTaskDetail->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
