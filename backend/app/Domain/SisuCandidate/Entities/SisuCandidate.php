<?php

namespace App\Domain\SisuCandidate\Entities;

class SisuCandidate
{
    public function __construct(
        public readonly string $id,
        public readonly string $name,
        public readonly string $normalizedName,
        public readonly ?string $enemRegistration = null,
        public readonly ?string $college = null,
        public readonly ?string $course = null,
        public readonly ?string $shift = null,
        public readonly ?string $classification = null,
        public readonly ?string $approvedShift = null,
        public readonly ?string $modality = null,
    ) {}
}
