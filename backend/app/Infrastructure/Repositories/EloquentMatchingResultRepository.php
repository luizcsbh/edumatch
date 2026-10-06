<?php

namespace App\Infrastructure\Repositories;

use App\Domain\Matching\Entities\MatchingResult;
use App\Domain\Matching\Enums\MatchDecision;
use App\Domain\Matching\Repositories\MatchingResultRepositoryInterface;
use App\Infrastructure\Models\MatchingResultModel;

class EloquentMatchingResultRepository implements MatchingResultRepositoryInterface
{
    public function findById(string $id): ?MatchingResult
    {
        $m = MatchingResultModel::find($id);
        return $m ? $this->toEntity($m) : null;
    }

    public function findByDecision(MatchDecision $decision): array
    {
        $models = MatchingResultModel::where('decision', $decision->value)->get();
        return $models->map(fn($m) => $this->toEntity($m))->all();
    }

    public function save(MatchingResult $result): void
    {
        MatchingResultModel::updateOrCreate(
            ['id' => $result->id],
            [
                'student_id' => $result->studentId,
                'sisu_candidate_id' => $result->sisuCandidateId,
                'probability' => $result->probability,
                'decision' => $result->decision->value,
                'model_version' => $result->modelVersion,
                'dataset_version' => $result->datasetVersion,
                'features' => $result->features,
            ]
        );
    }

    public function getPendingReviews(int $limit = 50): array
    {
        $models = MatchingResultModel::where('decision', MatchDecision::HUMAN_REVIEW->value)
            ->with(['student', 'candidate'])
            ->limit($limit)
            ->get();

        return $models->map(fn($m) => $this->toEntity($m))->all();
    }

    private function toEntity(MatchingResultModel $m): MatchingResult
    {
        return new MatchingResult(
            id: $m->id,
            studentId: $m->student_id,
            sisuCandidateId: $m->sisu_candidate_id,
            probability: (float) $m->probability,
            decision: MatchDecision::from($m->decision),
            modelVersion: $m->model_version,
            datasetVersion: $m->dataset_version,
            features: $m->features ?? [],
            createdAt: $m->created_at?->toIso8601String(),
        );
    }
}
