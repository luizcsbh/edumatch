<?php

namespace App\Presentation\Http\Controllers;

use App\Domain\Student\Repositories\StudentRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class StudentController
{
    public function __construct(
        private readonly StudentRepositoryInterface $studentRepo
    ) {}

    public function index(Request $request): JsonResponse
    {
        $page = (int) $request->query('page', 1);
        $perPage = min((int) $request->query('per_page', 20), 100);

        $students = $this->studentRepo->getPaginated($page, $perPage);
        $total = $this->studentRepo->count();

        // LGPD: Mask sensitive fields in API output
        $items = array_map(function ($s) {
            return [
                'id' => $s->id,
                'name' => $s->name,
                'normalized_name' => $s->normalizedName,
                'registration' => $s->registration,
                'cpf' => $s->cpf ? substr($s->cpf, 0, 3) . '.***.***-' . substr($s->cpf, -2) : null,
                'email' => $s->email ? preg_replace('/(?<=.{2}).(?=.*@)/u', '*', $s->email) : null,
                'course' => $s->course,
                'unit' => $s->unit,
                'source' => $s->source,
            ];
        }, $students);

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
        $student = $this->studentRepo->findById($id);
        if (!$student) {
            return response()->json(['message' => 'Aluno não encontrado'], 404);
        }

        return response()->json([
            'data' => [
                'id' => $student->id,
                'name' => $student->name,
                'normalized_name' => $student->normalizedName,
                'registration' => $student->registration,
                'cpf' => $student->cpf ? substr($student->cpf, 0, 3) . '.***.***-' . substr($student->cpf, -2) : null,
                'email' => $student->email ? preg_replace('/(?<=.{2}).(?=.*@)/u', '*', $student->email) : null,
                'course' => $student->course,
                'unit' => $student->unit,
            ],
        ]);
    }
}
