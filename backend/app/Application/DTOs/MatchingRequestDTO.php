<?php

namespace App\Application\DTOs;

class MatchingRequestDTO
{
    public function __construct(
        public readonly string $studentId,
        public readonly string $sisuCandidateId,
    ) {}
}
