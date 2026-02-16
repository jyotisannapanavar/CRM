<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Opportunity extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'naming_series',
        'opportunity_type_id',
        'opportunity_stage_id',
        'opportunity_from',
        'lead_id',
        'source_id',
        'expected_closing',
        'party_name',
        'opportunity_owner',
        'probability',
        'status_id',
        'company_name',
        'industry_id',
        'no_of_employees',
        'city',
        'state',
        'country',
        'annual_revenue',
        'market_segment',
        'currency',
        'opportunity_amount',
    ];

    protected $casts = [
        'annual_revenue' => 'decimal:2',
        'opportunity_amount' => 'decimal:2',
        'probability' => 'decimal:2',
        'expected_closing' => 'date',
    ];

    protected $with = ['opportunityType', 'opportunityStage', 'source', 'status', 'industry', 'owner', 'lead'];

    public function opportunityType(): BelongsTo
    {
        return $this->belongsTo(OpportunityType::class);
    }

    public function opportunityStage(): BelongsTo
    {
        return $this->belongsTo(OpportunityStage::class);
    }

    public function source(): BelongsTo
    {
        return $this->belongsTo(Source::class);
    }

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(Status::class);
    }

    public function industry(): BelongsTo
    {
        return $this->belongsTo(IndustryType::class, 'industry_id');
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'opportunity_owner');
    }

    public function lostReasons(): BelongsToMany
    {
        return $this->belongsToMany(OpportunityLostReason::class, 'opportunity_lost_reason_details');
    }

    public function competitors(): BelongsToMany
    {
        return $this->belongsToMany(Competitor::class, 'competitor_details');
    }

    public function notes(): MorphMany
    {
        return $this->morphMany(CrmNote::class, 'notable');
    }
}
