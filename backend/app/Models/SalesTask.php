<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SalesTask extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'task_source_id',
        'task_type_id',
        'sales_assign_id',
    ];

    public function taskSource()
    {
        return $this->belongsTo(TaskSource::class);
    }

    public function taskType()
    {
        return $this->belongsTo(TaskType::class);
    }

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'sales_assign_id');
    }
}
