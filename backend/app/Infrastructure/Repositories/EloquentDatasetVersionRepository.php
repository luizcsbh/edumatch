<?php

namespace App\Infrastructure\Repositories;

use App\Domain\Dataset\Entities\DatasetVersion;
use App\Domain\Dataset\Entities\DatasetCandidate;
use App\Domain\Dataset\Repositories\DatasetVersionRepositoryInterface;
use App\Infrastructure\Models\DatasetVersionModel;
use App\Infrastructure\Models\DatasetCandidateModel;
use App\Domain\Matching\Enums\DatasetCandidateStatus;

class EloquentDatasetVersionRepository implements DatasetVersionRepositoryInterface
{
    public function findByVersion(string $version): ?DatasetVersion
    {
        $m = DatasetVersionModel::where('version', $version)->first();
        return $m ? $this->toEntity($m) : null;
    }

    public function getLatest(): ?DatasetVersion
    {
        $m = DatasetVersionModel::latest('created_at')->first();
        return $m ? $this->toEntity($m) : null;
    }

    public function save(DatasetVersion $version): void
    {
        DatasetVersionModel::updateOrCreate(
            ['version' => $version->version],
            [
                'id' => $version->id,
                'records' => $version->records,
                'positive' => $version->positive,
                'negative' => $version->negative,
                'hard_negative' => $version->hardNegative,
                'train' => $version->train,
                'validation' => $version->validation,
                'test' => $version->test,
                'random_seed' => $version->randomSeed,
                'feature_version' => $version->featureVersion,
                'source_versions' => $version->sourceVersions,
            ]
        );
    }

    public function saveCandidate(DatasetCandidate $candidate): void
    {
        DatasetCandidateModel::updateOrCreate(
            ['id' => $candidate->id],
            [
                'student_name' => $candidate->studentName,
                'candidate_name' => $candidate->candidateName,
                'normalized_student_name' => $candidate->normalizedStudentName,
                'normalized_candidate_name' => $candidate->normalizedCandidateName,
                'features' => $candidate->features,
                'label' => $candidate->label,
                'status' => $candidate->status->value,
                'source' => $candidate->source,
                'reviewed_by' => $candidate->reviewedBy,
                'reviewed_at' => $candidate->reviewedAt,
            ]
        );
    }

    public function getPendingCandidates(): array
    {
        $models = DatasetCandidateModel::where('status', DatasetCandidateStatus::PENDING->value)->get();
        return $models->map(fn($m) => new DatasetCandidate(
            id: $m->id,
            studentName: $m->student_name,
            candidateName: $m->candidate_name,
            normalizedStudentName: $m->normalized_student_name,
            normalizedCandidateName: $m->normalized_candidate_name,
            features: $m->features ?? [],
            label: (int) $m->label,
            status: DatasetCandidateStatus::from($m->status),
            source: $m->source,
            reviewedBy: $m->reviewed_by,
            reviewedAt: $m->reviewed_at,
        ))->all();
    }

    private function toEntity(DatasetVersionModel $m): DatasetVersion
    {
        return new DatasetVersion(
            id: $m->id,
            version: $m->version,
            records: (int) $m->records,
            positive: (int) $m->positive,
            negative: (int) $m->negative,
            hardNegative: (int) $m->hard_negative,
            train: (int) $m->train,
            validation: (int) $m->validation,
            test: (int) $m->test,
            randomSeed: (int) $m->random_seed,
            featureVersion: $m->feature_version,
            sourceVersions: $m->source_versions ?? [],
        );
    }
}
