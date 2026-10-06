<?php

namespace App\Domain\Dataset\Entities;

class MlModel
{
    public function __construct(
        public readonly string $id,
        public readonly string $version,
        public readonly string $datasetVersion,
        public readonly string $featureVersion = '1.0.0',
        public readonly string $algorithmVersion = '1.0.0',
        public readonly ?float $accuracy = null,
        public readonly ?float $precision = null,
        public readonly ?float $recall = null,
        public readonly ?float $f1Score = null,
    ) {}
}
