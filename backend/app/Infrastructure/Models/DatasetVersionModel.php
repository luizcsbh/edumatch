<?php

namespace App\Infrastructure\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class DatasetVersionModel extends Model
{
    use HasUuids;

    protected $table = 'dataset_versions';

    protected $fillable = [
        'id', 'version', 'records', 'positive', 'negative',
        'hard_negative', 'train', 'validation', 'test',
        'random_seed', 'feature_version', 'source_versions',
    ];

    protected $casts = [
        'source_versions' => 'array',
        'records' => 'integer',
        'positive' => 'integer',
        'negative' => 'integer',
        'hard_negative' => 'integer',
        'train' => 'integer',
        'validation' => 'integer',
        'test' => 'integer',
    ];
}
