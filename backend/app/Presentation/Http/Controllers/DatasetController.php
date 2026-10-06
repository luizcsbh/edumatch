<?php

namespace App\Presentation\Http\Controllers;

use App\Domain\Dataset\Repositories\DatasetVersionRepositoryInterface;
use App\Application\Services\MlServiceClient;
use Illuminate\Http\JsonResponse;

class DatasetController
{
    public function __construct(
        private readonly DatasetVersionRepositoryInterface $datasetRepo,
        private readonly MlServiceClient $mlClient,
    ) {}

    public function latestVersion(): JsonResponse
    {
        $version = $this->datasetRepo->getLatest();
        if (!$version) {
            return response()->json(['message' => 'Nenhum dataset versionado encontrado'], 404);
        }

        return response()->json([
            'version' => $version->version,
            'records' => $version->records,
            'positive' => $version->positive,
            'negative' => $version->negative,
            'hard_negative' => $version->hardNegative,
            'splits' => [
                'train' => $version->train,
                'validation' => $version->validation,
                'test' => $version->test,
            ],
            'feature_version' => $version->featureVersion,
            'random_seed' => $version->randomSeed,
        ]);
    }

    public function pendingCandidates(): JsonResponse
    {
        $candidates = $this->datasetRepo->getPendingCandidates();
        return response()->json([
            'count' => count($candidates),
            'items' => array_map(fn($c) => [
                'id' => $c->id,
                'student_name' => $c->studentName,
                'candidate_name' => $c->candidateName,
                'label' => $c->label,
                'status' => $c->status->value,
                'reviewed_by' => $c->reviewedBy,
                'reviewed_at' => $c->reviewedAt,
            ], $candidates),
        ]);
    }

    public function activeModel(): JsonResponse
    {
        $info = $this->mlClient->getModelInfo();
        return response()->json($info);
    }
}
