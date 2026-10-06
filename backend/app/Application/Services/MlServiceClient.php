<?php

namespace App\Application\Services;

use App\Application\DTOs\PredictionResponseDTO;

interface MlServiceClient
{
    public function predict(string $studentName, string $candidateName): PredictionResponseDTO;
    public function batchPredict(array $pairs): array;
    public function getModelInfo(): array;
    public function checkHealth(): bool;
}
