<?php

namespace App\Application\DTOs;

class ImportReportDTO
{
    public function __construct(
        public readonly string $fileName,
        public readonly string $fileType,
        public readonly int $totalRecords,
        public readonly int $validRecords,
        public readonly int $invalidRecords,
        public readonly int $emptyFields,
        public readonly int $duplicates,
        public readonly array $columns = [],
    ) {}

    public function toArray(): array
    {
        return [
            'file_name' => $this->fileName,
            'file_type' => $this->fileType,
            'total_records' => $this->totalRecords,
            'valid_records' => $this->validRecords,
            'invalid_records' => $this->invalidRecords,
            'empty_fields' => $this->emptyFields,
            'duplicates' => $this->duplicates,
            'columns' => $this->columns,
        ];
    }
}
