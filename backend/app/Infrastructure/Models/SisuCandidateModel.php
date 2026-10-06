<?php

namespace App\Infrastructure\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class SisuCandidateModel extends Model
{
    use HasUuids;

    protected $table = 'sisu_candidates';

    protected $fillable = [
        'id', 'name', 'normalized_name', 'enem_registration',
        'college', 'course', 'shift', 'classification',
        'approved_shift', 'modality',
    ];
}
