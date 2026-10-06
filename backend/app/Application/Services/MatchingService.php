<?php

namespace App\Application\Services;

use App\Domain\Matching\Entities\MatchingResult;
use App\Domain\Matching\Enums\MatchDecision;
use App\Domain\Matching\Repositories\MatchingResultRepositoryInterface;
use App\Domain\Student\Repositories\StudentRepositoryInterface;
use App\Domain\SisuCandidate\Repositories\SisuCandidateRepositoryInterface;
use App\Application\DTOs\MatchingResultDTO;
use Illuminate\Support\Str;

class MatchingService
{
    public function __construct(
        private readonly StudentRepositoryInterface $studentRepo,
        private readonly SisuCandidateRepositoryInterface $candidateRepo,
        private readonly MatchingResultRepositoryInterface $resultRepo,
        private readonly MlServiceClient $mlClient,
    ) {}

    public function matchCandidate(string $candidateId): array
    {
        $candidate = $this->candidateRepo->findById($candidateId);
        if (!$candidate) {
            throw new \InvalidArgumentException("Candidato não encontrado: {$candidateId}");
        }

        // Candidate blocking: search potential student matches by tokens
        $tokens = explode(' ', $candidate->normalizedName);
        $firstName = $tokens[0] ?? '';
        $lastName = end($tokens) ?: '';

        $potentialStudents = array_merge(
            $this->studentRepo->findByNormalizedName($firstName),
            $this->studentRepo->findByNormalizedName($lastName)
        );

        // Deduplicate students
        $uniqueStudents = [];
        foreach ($potentialStudents as $s) {
            $uniqueStudents[$s->id] = $s;
        }

        $results = [];

        foreach ($uniqueStudents as $student) {
            $prediction = $this->mlClient->predict($student->name, $candidate->name);
            $decision = MatchDecision::from($prediction->decision);

            $matchResult = new MatchingResult(
                id: (string) Str::uuid(),
                studentId: $student->id,
                sisuCandidateId: $candidate->id,
                probability: $prediction->probability,
                decision: $decision,
                modelVersion: $prediction->modelVersion,
                datasetVersion: $prediction->datasetVersion,
                features: $prediction->features,
            );

            $this->resultRepo->save($matchResult);

            $results[] = new MatchingResultDTO(
                id: $matchResult->id,
                studentId: $student->id,
                studentName: $student->name,
                candidateId: $candidate->id,
                candidateName: $candidate->name,
                probability: $matchResult->probability,
                decision: $decision->value,
                modelVersion: $matchResult->modelVersion,
                datasetVersion: $matchResult->datasetVersion,
                features: $matchResult->features,
            );
        }

        return $results;
    }
}
