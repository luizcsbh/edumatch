<?php

namespace App\Infrastructure\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class StudentModel extends Model
{
    use HasUuids;

    protected $table = 'students';

    protected $fillable = [
        'id', 'name', 'normalized_name', 'registration',
        'cpf', 'email', 'phone', 'course', 'unit',
        'source', 'source_id',
    ];

    protected $casts = [
        'cpf' => 'encrypted',
        'email' => 'encrypted',
    ];
}
