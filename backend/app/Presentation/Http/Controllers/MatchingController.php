<?php

namespace App\Presentation\Http\Controllers;

use App\Application\Services\MatchingService;
use App\Domain\Matching\Repositories\MatchingResultRepositoryInterface;
use App\Domain\Matching\Enums\MatchDecision;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MatchingController
{
    public function __construct(
        private readonly MatchingService $matchingService,
        private readonly MatchingResultRepositoryInterface $resultRepo,
    ) {}

    public function matchCandidate(string $candidateId): JsonResponse
    {
        try {
            $results = $this->matchingService->matchCandidate($candidateId);
            return response()->json([
                'candidate_id' => $candidateId,
                'matches_found' => count($results),
                'results' => array_map(fn($r) => $r->toArray(), $results),
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }

    public function getPendingReviews(): JsonResponse
    {
        $pending = $this->resultRepo->getPendingReviews(100);
        return response()->json([
            'count' => count($pending),
            'items' => array_map(fn($m) => [
                'id' => $m->id,
                'student_id' => $m->studentId,
                'sisu_candidate_id' => $m->sisuCandidateId,
                'probability' => $m->probability,
                'decision' => $m->decision->value,
                'model_version' => $m->modelVersion,
                'features' => $m->features,
            ], $pending),
        ]);
    }
}
