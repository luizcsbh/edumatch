<?php

namespace App\Domain\Matching\Entities;

use App\Domain\Matching\Enums\MatchDecision;

class HumanReview
{
    public function __construct(
        public readonly string $id,
        public readonly string $matchingResultId,
        public readonly string $reviewedBy,
        public readonly string $reviewedAt,
        public readonly MatchDecision $decision,
        public readonly ?string $comment = null,
    ) {}
}
