<?php

namespace App\Domain\Dataset\Entities;

class DatasetVersion
{
    public function __construct(
        public readonly string $id,
        public readonly string $version,
        public readonly int $records,
        public readonly int $positive,
        public readonly int $negative,
        public readonly int $hardNegative,
        public readonly int $train,
        public readonly int $validation,
        public readonly int $test,
        public readonly int $randomSeed = 42,
        public readonly string $featureVersion = '1.0.0',
        public readonly array $sourceVersions = [],
    ) {}
}
