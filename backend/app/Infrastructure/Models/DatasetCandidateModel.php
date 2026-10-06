<?php

namespace App\Infrastructure\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class DatasetCandidateModel extends Model
{
    use HasUuids;

    protected $table = 'dataset_candidates';

    protected $fillable = [
        'id', 'student_name', 'candidate_name',
        'normalized_student_name', 'normalized_candidate_name',
        'features', 'label', 'status', 'source',
        'reviewed_by', 'reviewed_at',
    ];

    protected $casts = [
        'features' => 'array',
        'label' => 'integer',
    ];
}
