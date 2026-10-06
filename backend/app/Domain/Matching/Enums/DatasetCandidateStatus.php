<?php

namespace App\Domain\Matching\Enums;

enum DatasetCandidateStatus: string
{
    case PENDING = 'PENDING';
    case APPROVED = 'APPROVED';
    case REJECTED = 'REJECTED';
}
