<?php

namespace App\Domain\SisuCandidate\Repositories;

use App\Domain\SisuCandidate\Entities\SisuCandidate;

interface SisuCandidateRepositoryInterface
{
    public function findById(string $id): ?SisuCandidate;
    public function findByNormalizedName(string $normalizedName): array;
    public function save(SisuCandidate $candidate): void;
    public function saveMany(array $candidates): void;
    public function count(): int;
    public function getPaginated(int $page, int $perPage): array;
}
