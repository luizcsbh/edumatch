<?php

namespace App\Domain\Matching\Enums;

enum MatchDecision: string
{
    case MATCH = 'MATCH';
    case NO_MATCH = 'NO_MATCH';
    case HUMAN_REVIEW = 'HUMAN_REVIEW';
}
