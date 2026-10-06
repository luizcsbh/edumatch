<?php

namespace App\Domain\Dataset\Entities;

use App\Domain\Matching\Enums\DatasetCandidateStatus;

class DatasetCandidate
{
    public function __construct(
        public readonly string $id,
        public readonly string $studentName,
        public readonly string $candidateName,
        public readonly string $normalizedStudentName,
        public readonly string $normalizedCandidateName,
        public readonly array $features,
        public readonly int $label,
        public readonly DatasetCandidateStatus $status = DatasetCandidateStatus::PENDING,
        public readonly string $source = 'human_review',
        public readonly ?string $reviewedBy = null,
        public readonly ?string $reviewedAt = null,
    ) {}
}
