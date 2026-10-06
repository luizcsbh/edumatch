<?php

namespace App\Application\DTOs;

class PredictionResponseDTO
{
    public function __construct(
        public readonly bool $match,
        public readonly float $probability,
        public readonly string $decision,
        public readonly string $modelVersion,
        public readonly string $datasetVersion,
        public readonly array $features = [],
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            match: $data['match'] ?? false,
            probability: (float) ($data['probability'] ?? 0.0),
            decision: $data['decision'] ?? 'HUMAN_REVIEW',
            modelVersion: $data['modelVersion'] ?? '1.0.0',
            datasetVersion: $data['datasetVersion'] ?? '1.0.0',
            features: $data['features'] ?? [],
        );
    }
}
