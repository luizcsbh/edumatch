<?php

namespace App\Domain\Student\Entities;

class Student
{
    public function __construct(
        public readonly string $id,
        public readonly string $name,
        public readonly string $normalizedName,
        public readonly ?string $registration = null,
        public readonly ?string $cpf = null,
        public readonly ?string $email = null,
        public readonly ?string $phone = null,
        public readonly ?string $course = null,
        public readonly ?string $unit = null,
        public readonly string $source = 'chromos',
        public readonly ?string $sourceId = null,
    ) {}
}
