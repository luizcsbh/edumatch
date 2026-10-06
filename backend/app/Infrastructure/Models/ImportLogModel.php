<?php

namespace App\Infrastructure\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ImportLogModel extends Model
{
    use HasUuids;

    protected $table = 'import_logs';

    protected $fillable = [
        'id', 'file_name', 'file_type', 'records_total',
        'records_valid', 'records_invalid', 'empty_fields',
        'duplicates', 'imported_by', 'imported_at',
    ];

    protected $casts = [
        'records_total' => 'integer',
        'records_valid' => 'integer',
        'records_invalid' => 'integer',
        'empty_fields' => 'integer',
        'duplicates' => 'integer',
    ];
}
