<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Application\Services\MatchingService;
use App\Domain\Student\Repositories\StudentRepositoryInterface;
use App\Domain\SisuCandidate\Repositories\SisuCandidateRepositoryInterface;
use App\Domain\Matching\Repositories\MatchingResultRepositoryInterface;
use App\Application\Services\MlServiceClient;
use App\Domain\SisuCandidate\Entities\SisuCandidate;
use App\Domain\Student\Entities\Student;
use App\Application\DTOs\PredictionResponseDTO;

class MatchingServiceTest extends TestCase
{
    public function testMatchCandidateDelegatesToMlService()
    {
        $studentRepo = $this->createMock(StudentRepositoryInterface::class);
        $candidateRepo = $this->createMock(SisuCandidateRepositoryInterface::class);
        $resultRepo = $this->createMock(MatchingResultRepositoryInterface::class);
        $mlClient = $this->createMock(MlServiceClient::class);

        $candidate = new SisuCandidate(
            id: 'c-1',
            name: 'JOAO SILVA',
            normalizedName: 'JOAO SILVA'
        );

        $student = new Student(
            id: 's-1',
            name: 'JOAO SILVA',
            normalizedName: 'JOAO SILVA'
        );

        $candidateRepo->method('findById')->willReturn($candidate);
        $studentRepo->method('findByNormalizedName')->willReturn([$student]);

        $mlClient->method('predict')->willReturn(new PredictionResponseDTO(
            match: true,
            probability: 0.98,
            decision: 'MATCH',
            modelVersion: '1.0.0',
            datasetVersion: '1.0.0',
            features: ['jaro_winkler' => 1.0]
        ));

        $service = new MatchingService($studentRepo, $candidateRepo, $resultRepo, $mlClient);
        $results = $service->matchCandidate('c-1');

        $this->assertCount(1, $results);
        $this->assertEquals('MATCH', $results[0]->decision);
        $this->assertEquals(0.98, $results[0]->probability);
    }
}
