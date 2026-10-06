<?php

namespace App\Application\Services;

use App\Domain\Matching\Entities\HumanReview;
use App\Domain\Matching\Enums\MatchDecision;
use App\Domain\Matching\Enums\DatasetCandidateStatus;
use App\Domain\Matching\Repositories\MatchingResultRepositoryInterface;
use App\Domain\Dataset\Entities\DatasetCandidate;
use App\Domain\Dataset\Repositories\DatasetVersionRepositoryInterface;
use App\Domain\Student\Repositories\StudentRepositoryInterface;
use App\Domain\SisuCandidate\Repositories\SisuCandidateRepositoryInterface;
use Illuminate\Support\Str;

class HumanReviewService
{
    public function __construct(
        private readonly MatchingResultRepositoryInterface $resultRepo,
        private readonly DatasetVersionRepositoryInterface $datasetRepo,
        private readonly StudentRepositoryInterface $studentRepo,
        private readonly SisuCandidateRepositoryInterface $candidateRepo,
    ) {}

    public function submitReview(string $matchingResultId, string $decisionStr, string $reviewedBy, ?string $comment = null): HumanReview
    {
        $matching = $this->resultRepo->findById($matchingResultId);
        if (!$matching) {
            throw new \InvalidArgumentException("Resultado de matching não encontrado: {$matchingResultId}");
        }

        $decision = MatchDecision::from($decisionStr);
        $review = new HumanReview(
            id: (string) Str::uuid(),
            matchingResultId: $matching->id,
            reviewedBy: $reviewedBy,
            reviewedAt: date('c'),
            decision: $decision,
            comment: $comment,
        );

        $student = $this->studentRepo->findById($matching->studentId);
        $candidate = $this->candidateRepo->findById($matching->sisuCandidateId);

        if ($student && $candidate) {
            $candidateRecord = new DatasetCandidate(
                id: (string) Str::uuid(),
                studentName: $student->name,
                candidateName: $candidate->name,
                normalizedStudentName: $student->normalizedName,
                normalizedCandidateName: $candidate->normalizedName,
                features: $matching->features,
                label: $decision === MatchDecision::MATCH ? 1 : 0,
                status: DatasetCandidateStatus::PENDING,
                source: 'human_review',
                reviewedBy: $reviewedBy,
                reviewedAt: date('c'),
            );

            $this->datasetRepo->saveCandidate($candidateRecord);
        }

        return $review;
    }
}
