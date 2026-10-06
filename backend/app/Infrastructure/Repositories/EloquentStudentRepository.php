<?php

namespace App\Infrastructure\Repositories;

use App\Domain\Student\Entities\Student;
use App\Domain\Student\Repositories\StudentRepositoryInterface;
use App\Infrastructure\Models\StudentModel;

class EloquentStudentRepository implements StudentRepositoryInterface
{
    public function findById(string $id): ?Student
    {
        $model = StudentModel::find($id);
        return $model ? $this->toEntity($model) : null;
    }

    public function findByNormalizedName(string $normalizedName): array
    {
        $models = StudentModel::where('normalized_name', 'LIKE', "%{$normalizedName}%")->limit(100)->get();
        return $models->map(fn($m) => $this->toEntity($m))->all();
    }

    public function save(Student $student): void
    {
        StudentModel::updateOrCreate(
            ['id' => $student->id],
            [
                'name' => $student->name,
                'normalized_name' => $student->normalizedName,
                'registration' => $student->registration,
                'cpf' => $student->cpf,
                'email' => $student->email,
                'phone' => $student->phone,
                'course' => $student->course,
                'unit' => $student->unit,
                'source' => $student->source,
                'source_id' => $student->sourceId,
            ]
        );
    }

    public function saveMany(array $students): void
    {
        foreach ($students as $student) {
            $this->save($student);
        }
    }

    public function count(): int
    {
        return StudentModel::count();
    }

    public function getPaginated(int $page, int $perPage): array
    {
        $models = StudentModel::offset(($page - 1) * $perPage)->limit($perPage)->get();
        return $models->map(fn($m) => $this->toEntity($m))->all();
    }

    private function toEntity(StudentModel $m): Student
    {
        return new Student(
            id: $m->id,
            name: $m->name,
            normalizedName: $m->normalized_name,
            registration: $m->registration,
            cpf: $m->cpf,
            email: $m->email,
            phone: $m->phone,
            course: $m->course,
            unit: $m->unit,
            source: $m->source,
            sourceId: $m->source_id,
        );
    }
}
