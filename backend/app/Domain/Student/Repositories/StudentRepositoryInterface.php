<?php

namespace App\Domain\Student\Repositories;

use App\Domain\Student\Entities\Student;

interface StudentRepositoryInterface
{
    public function findById(string $id): ?Student;
    public function findByNormalizedName(string $normalizedName): array;
    public function save(Student $student): void;
    public function saveMany(array $students): void;
    public function count(): int;
    public function getPaginated(int $page, int $perPage): array;
}
