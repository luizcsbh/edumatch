<?php

namespace App\Infrastructure\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class MlModelModel extends Model
{
    use HasUuids;

    protected $table = 'ml_models';

    protected $fillable = [
        'id', 'version', 'dataset_version', 'feature_version',
        'algorithm_version', 'accuracy', 'precision_score',
        'recall', 'f1_score',
    ];

    protected $casts = [
        'accuracy' => 'float',
        'precision_score' => 'float',
        'recall' => 'float',
        'f1_score' => 'float',
    ];
}
