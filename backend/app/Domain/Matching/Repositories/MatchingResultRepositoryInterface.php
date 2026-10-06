<?php

namespace App\Domain\Matching\Repositories;

use App\Domain\Matching\Entities\MatchingResult;
use App\Domain\Matching\Enums\MatchDecision;

interface MatchingResultRepositoryInterface
{
    public function findById(string $id): ?MatchingResult;
    public function findByDecision(MatchDecision $decision): array;
    public function save(MatchingResult $result): void;
    public function getPendingReviews(int $limit = 50): array;
}
