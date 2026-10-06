<?php

namespace App\Infrastructure\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class HumanReviewModel extends Model
{
    use HasUuids;

    protected $table = 'human_reviews';

    protected $fillable = [
        'id', 'matching_result_id', 'reviewed_by',
        'reviewed_at', 'decision', 'comment',
    ];
}
