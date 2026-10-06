<?php

namespace App\Infrastructure\Repositories;

use App\Domain\SisuCandidate\Entities\SisuCandidate;
use App\Domain\SisuCandidate\Repositories\SisuCandidateRepositoryInterface;
use App\Infrastructure\Models\SisuCandidateModel;

class EloquentSisuCandidateRepository implements SisuCandidateRepositoryInterface
{
    public function findById(string $id): ?SisuCandidate
    {
        $model = SisuCandidateModel::find($id);
        return $model ? $this->toEntity($model) : null;
    }

    public function findByNormalizedName(string $normalizedName): array
    {
        $models = SisuCandidateModel::where('normalized_name', 'LIKE', "%{$normalizedName}%")->limit(100)->get();
        return $models->map(fn($m) => $this->toEntity($m))->all();
    }

    public function save(SisuCandidate $candidate): void
    {
        SisuCandidateModel::updateOrCreate(
            ['id' => $candidate->id],
            [
                'name' => $candidate->name,
                'normalized_name' => $candidate->normalizedName,
                'enem_registration' => $candidate->enemRegistration,
                'college' => $candidate->college,
                'course' => $candidate->course,
                'shift' => $candidate->shift,
                'classification' => $candidate->classification,
                'approved_shift' => $candidate->approvedShift,
                'modality' => $candidate->modality,
            ]
        );
    }

    public function saveMany(array $candidates): void
    {
        foreach ($candidates as $cand) {
            $this->save($cand);
        }
    }

    public function count(): int
    {
        return SisuCandidateModel::count();
    }

    public function getPaginated(int $page, int $perPage): array
    {
        $models = SisuCandidateModel::offset(($page - 1) * $perPage)->limit($perPage)->get();
        return $models->map(fn($m) => $this->toEntity($m))->all();
    }

    private function toEntity(SisuCandidateModel $m): SisuCandidate
    {
        return new SisuCandidate(
            id: $m->id,
            name: $m->name,
            normalizedName: $m->normalized_name,
            enemRegistration: $m->enem_registration,
            college: $m->college,
            course: $m->course,
            shift: $m->shift,
            classification: $m->classification,
            approvedShift: $m->approved_shift,
            modality: $m->modality,
        );
    }
}
