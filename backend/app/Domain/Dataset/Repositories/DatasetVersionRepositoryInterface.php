<?php

namespace App\Domain\Dataset\Repositories;

use App\Domain\Dataset\Entities\DatasetVersion;
use App\Domain\Dataset\Entities\DatasetCandidate;

interface DatasetVersionRepositoryInterface
{
    public function findByVersion(string $version): ?DatasetVersion;
    public function getLatest(): ?DatasetVersion;
    public function save(DatasetVersion $version): void;
    public function saveCandidate(DatasetCandidate $candidate): void;
    public function getPendingCandidates(): array;
}
