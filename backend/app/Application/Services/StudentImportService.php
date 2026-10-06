<?php

namespace App\Application\Services;

use App\Domain\Student\Entities\Student;
use App\Domain\Student\Repositories\StudentRepositoryInterface;
use App\Application\DTOs\ImportReportDTO;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Illuminate\Support\Str;

class StudentImportService
{
    public function __construct(
        private readonly StudentRepositoryInterface $repository
    ) {}

    public function import(string $filePath): ImportReportDTO
    {
        if (!file_exists($filePath)) {
            throw new \InvalidArgumentException("Arquivo não encontrado: {$filePath}");
        }

        $spreadsheet = IOFactory::load($filePath);
        $worksheet = $spreadsheet->getActiveSheet();
        $rows = $worksheet->toArray();

        if (empty($rows)) {
            return new ImportReportDTO(basename($filePath), 'chromos', 0, 0, 0, 0, 0);
        }

        $header = array_shift($rows);
        $headerMap = array_flip($header);

        $students = [];
        $valid = 0;
        $invalid = 0;
        $emptyFields = 0;
        $seen = [];
        $duplicates = 0;

        foreach ($rows as $row) {
            $name = trim($row[$headerMap['NOME DO ALUNO CHROMOS'] ?? 0] ?? '');
            if (empty($name)) {
                $invalid++;
                $emptyFields++;
                continue;
            }

            $normalizedName = $this->normalizeName($name);
            if (isset($seen[$normalizedName])) {
                $duplicates++;
            }
            $seen[$normalizedName] = true;

            $students[] = new Student(
                id: (string) Str::uuid(),
                name: $name,
                normalizedName: $normalizedName,
                registration: $row[$headerMap['MATRICULA'] ?? -1] ?? null,
                cpf: $row[$headerMap['CPF'] ?? -1] ?? null,
                email: $row[$headerMap['EMAIL'] ?? -1] ?? null,
                phone: $row[$headerMap['CELULAR_ALUNO'] ?? -1] ?? $row[$headerMap['TELEFONE_ALUNO'] ?? -1] ?? null,
                course: $row[$headerMap['CURSO'] ?? -1] ?? null,
                unit: $row[$headerMap['UNIDADE'] ?? -1] ?? null,
                source: 'chromos',
                sourceId: $row[$headerMap['MATRICULA'] ?? -1] ?? null,
            );
            $valid++;
        }

        $this->repository->saveMany($students);

        return new ImportReportDTO(
            fileName: basename($filePath),
            fileType: 'chromos',
            totalRecords: count($rows),
            validRecords: $valid,
            invalidRecords: $invalid,
            emptyFields: $emptyFields,
            duplicates: $duplicates,
            columns: $header,
        );
    }

    private function normalizeName(string $name): string
    {
        $normalized = mb_strtoupper(trim($name), 'UTF-8');
        $normalized = preg_replace('/[-_.\/\\\\,;:!?\'"()[\]{}]/', ' ', $normalized);
        $normalized = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $normalized);
        $normalized = preg_replace('/[^A-Z0-9\s]/', ' ', $normalized);
        $tokens = array_filter(preg_split('/\s+/', $normalized));
        return implode(' ', $tokens);
    }
}
