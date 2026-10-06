<?php

namespace App\Infrastructure\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class MatchingResultModel extends Model
{
    use HasUuids;

    protected $table = 'matching_results';

    protected $fillable = [
        'id', 'student_id', 'sisu_candidate_id',
        'probability', 'decision', 'model_version',
        'dataset_version', 'features',
    ];

    protected $casts = [
        'features' => 'array',
        'probability' => 'float',
    ];

    public function student()
    {
        return $this->belongsTo(StudentModel::class, 'student_id');
    }

    public function candidate()
    {
        return $this->belongsTo(SisuCandidateModel::class, 'sisu_candidate_id');
    }
}
