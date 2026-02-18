<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SalesTask;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class SalesTaskController extends Controller
{
    public function index()
    {
        $salesTasks = SalesTask::with(['taskSource', 'taskType', 'assignedUser'])->latest()->get();
        return response()->json($salesTasks);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'task_source_id' => 'required|exists:task_sources,id',
            'task_type_id' => 'required|exists:task_types,id',
            'sales_assign_id' => 'nullable|exists:users,id',
        ]);

        $salesTask = SalesTask::create($validated);

        return response()->json($salesTask, Response::HTTP_CREATED);
    }

    public function show(SalesTask $salesTask)
    {
        $salesTask->load(['taskSource', 'taskType', 'assignedUser']);
        return response()->json($salesTask);
    }

    public function update(Request $request, SalesTask $salesTask)
    {
        $validated = $request->validate([
            'task_source_id' => 'exists:task_sources,id',
            'task_type_id' => 'exists:task_types,id',
            'sales_assign_id' => 'nullable|exists:users,id',
        ]);

        $salesTask->update($validated);

        return response()->json($salesTask);
    }

    public function destroy(SalesTask $salesTask)
    {
        $salesTask->delete();
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
