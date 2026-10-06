<?php

namespace App\Application\DTOs;

class MatchingResultDTO
{
    public function __construct(
        public readonly string $id,
        public readonly string $studentId,
        public readonly string $studentName,
        public readonly string $candidateId,
        public readonly string $candidateName,
        public readonly float $probability,
        public readonly string $decision,
        public readonly string $modelVersion,
        public readonly string $datasetVersion,
        public readonly array $features,
    ) {}

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'student_id' => $this->studentId,
            'student_name' => $this->studentName,
            'candidate_id' => $this->candidateId,
            'candidate_name' => $this->candidateName,
            'probability' => $this->probability,
            'decision' => $this->decision,
            'model_version' => $this->modelVersion,
            'dataset_version' => $this->datasetVersion,
            'features' => $this->features,
        ];
    }
}
