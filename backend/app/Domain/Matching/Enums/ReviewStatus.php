<?php

namespace App\Domain\Matching\Enums;

enum ReviewStatus: string
{
    case PENDING = 'PENDING';
    case APPROVED = 'APPROVED';
    case REJECTED = 'REJECTED';
}
