<?php

namespace App\Presentation\Http\Controllers;

use App\Domain\SisuCandidate\Repositories\SisuCandidateRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SisuCandidateController
{
    public function __construct(
        private readonly SisuCandidateRepositoryInterface $candidateRepo
    ) {}

    public function index(Request $request): JsonResponse
    {
        $page = (int) $request->query('page', 1);
        $perPage = min((int) $request->query('per_page', 20), 100);

        $candidates = $this->candidateRepo->getPaginated($page, $perPage);
        $total = $this->candidateRepo->count();

        $items = array_map(function ($c) {
            return [
                'id' => $c->id,
                'name' => $c->name,
                'normalized_name' => $c->normalizedName,
                'enem_registration' => $c->enemRegistration,
                'college' => $c->college,
                'course' => $c->course,
                'shift' => $c->shift,
                'classification' => $c->classification,
                'approved_shift' => $c->approvedShift,
                'modality' => $c->modality,
            ];
        }, $candidates);

        return response()->json([
            'data' => $items,
            'meta' => [
                'page' => $page,
                'per_page' => $perPage,
                'total' => $total,
            ],
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $candidate = $this->candidateRepo->findById($id);
        if (!$candidate) {
            return response()->json(['message' => 'Candidato não encontrado'], 404);
        }

        return response()->json([
            'data' => [
                'id' => $candidate->id,
                'name' => $candidate->name,
                'normalized_name' => $candidate->normalizedName,
                'enem_registration' => $candidate->enemRegistration,
                'college' => $candidate->college,
                'course' => $candidate->course,
                'shift' => $candidate->shift,
                'classification' => $candidate->classification,
                'approved_shift' => $candidate->approvedShift,
                'modality' => $candidate->modality,
            ],
        ]);
    }
}
