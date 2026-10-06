<?php

namespace App\Infrastructure\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class AuditLogModel extends Model
{
    use HasUuids;

    protected $table = 'audit_logs';

    protected $fillable = [
        'id', 'action', 'entity_type', 'entity_id',
        'user_id', 'details',
    ];

    protected $casts = [
        'details' => 'array',
    ];
}
