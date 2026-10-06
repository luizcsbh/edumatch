<?php

namespace App\Infrastructure\Http;

use App\Application\Services\MlServiceClient;
use App\Application\DTOs\PredictionResponseDTO;
use Illuminate\Support\Facades\Http;

class MlServiceHttpClient implements MlServiceClient
{
    private string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('edumatch.ml_service_url', 'http://matching-ml-service:3001'), '/');
    }

    public function predict(string $studentName, string $candidateName): PredictionResponseDTO
    {
        try {
            $response = Http::timeout(5)->post("{$this->baseUrl}/api/v1/predict", [
                'studentName' => $studentName,
                'candidateName' => $candidateName,
            ]);

            if ($response->successful()) {
                return PredictionResponseDTO::fromArray($response->json());
            }
        } catch (\Throwable $e) {
            // Fallback heuristics when ML service is offline
        }

        return $this->fallbackPredict($studentName, $candidateName);
    }

    public function batchPredict(array $pairs): array
    {
        try {
            $response = Http::timeout(15)->post("{$this->baseUrl}/api/v1/batch-predict", [
                'pairs' => $pairs,
            ]);

            if ($response->successful()) {
                $results = $response->json()['results'] ?? [];
                return array_map(fn($r) => PredictionResponseDTO::fromArray($r), $results);
            }
        } catch (\Throwable $e) {
            // Fallback
        }

        $results = [];
        foreach ($pairs as $p) {
            $results[] = $this->fallbackPredict($p['studentName'] ?? '', $p['candidateName'] ?? '');
        }
        return $results;
    }

    public function getModelInfo(): array
    {
        try {
            $response = Http::timeout(3)->get("{$this->baseUrl}/api/v1/model");
            return $response->successful() ? $response->json() : ['status' => 'UNAVAILABLE'];
        } catch (\Throwable $e) {
            return ['status' => 'OFFLINE', 'error' => $e->getMessage()];
        }
    }

    public function checkHealth(): bool
    {
        try {
            $response = Http::timeout(2)->get("{$this->baseUrl}/api/v1/health");
            return $response->successful() && ($response->json('status') === 'UP');
        } catch (\Throwable $e) {
            return false;
        }
    }

    private function fallbackPredict(string $s1, string $s2): PredictionResponseDTO
    {
        $n1 = strtoupper(trim($s1));
        $n2 = strtoupper(trim($s2));

        similar_text($n1, $n2, $percent);
        $prob = $percent / 100.0;

        $matchThreshold = config('edumatch.match_threshold', 0.90);
        $noMatchThreshold = config('edumatch.no_match_threshold', 0.30);

        $decision = 'HUMAN_REVIEW';
        if ($prob >= $matchThreshold) $decision = 'MATCH';
        elseif ($prob <= $noMatchThreshold) $decision = 'NO_MATCH';

        return new PredictionResponseDTO(
            match: $decision === 'MATCH',
            probability: round($prob, 4),
            decision: $decision,
            modelVersion: 'heuristic-1.0.0',
            datasetVersion: '1.0.0',
            features: [
                'similar_text' => $prob,
            ]
        );
    }
}
