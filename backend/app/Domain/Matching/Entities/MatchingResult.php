<?php

namespace App\Domain\Matching\Entities;

use App\Domain\Matching\Enums\MatchDecision;

class MatchingResult
{
    public function __construct(
        public readonly string $id,
        public readonly string $studentId,
        public readonly string $sisuCandidateId,
        public readonly float $probability,
        public readonly MatchDecision $decision,
        public readonly string $modelVersion,
        public readonly string $datasetVersion,
        public readonly array $features,
        public readonly ?string $createdAt = null,
    ) {}
}
