<?php

namespace App\Application\Services;

use App\Domain\SisuCandidate\Entities\SisuCandidate;
use App\Domain\SisuCandidate\Repositories\SisuCandidateRepositoryInterface;
use App\Application\DTOs\ImportReportDTO;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Illuminate\Support\Str;

class SisuImportService
{
    public function __construct(
        private readonly SisuCandidateRepositoryInterface $repository
    ) {}

    public function import(string $filePath): ImportReportDTO
    {
        if (!file_exists($filePath)) {
            throw new \InvalidArgumentException("Arquivo não encontrado: {$filePath}");
        }

        $spreadsheet = IOFactory::load($filePath);
        $sheet = $spreadsheet->getSheetByName('Planilha1') ?? $spreadsheet->getActiveSheet();
        $rows = $sheet->toArray();

        if (empty($rows)) {
            return new ImportReportDTO(basename($filePath), 'sisu', 0, 0, 0, 0, 0);
        }

        $header = array_shift($rows);
        $headerMap = array_flip($header);

        $candidates = [];
        $valid = 0;
        $invalid = 0;
        $emptyFields = 0;
        $seen = [];
        $duplicates = 0;

        foreach ($rows as $row) {
            $name = trim($row[$headerMap['nome_candidato'] ?? 0] ?? '');
            if (empty($name)) {
                $invalid++;
                $emptyFields++;
                continue;
            }

            $treatedName = trim($row[$headerMap['nome_tratado'] ?? -1] ?? '') ?: $name;
            $normalizedName = $this->normalizeName($treatedName);

            if (isset($seen[$normalizedName])) {
                $duplicates++;
            }
            $seen[$normalizedName] = true;

            $candidates[] = new SisuCandidate(
                id: (string) Str::uuid(),
                name: $name,
                normalizedName: $normalizedName,
                enemRegistration: $row[$headerMap['incricao_enem'] ?? -1] ?? null,
                college: $row[$headerMap['faculdade'] ?? -1] ?? null,
                course: $row[$headerMap['curso'] ?? -1] ?? null,
                shift: $row[$headerMap['turno'] ?? -1] ?? null,
                classification: (string) ($row[$headerMap['classificacao'] ?? -1] ?? ''),
                approvedShift: $row[$headerMap['turno_aprovado'] ?? -1] ?? null,
                modality: $row[$headerMap['modalidade'] ?? -1] ?? null,
            );
            $valid++;
        }

        $this->repository->saveMany($candidates);

        return new ImportReportDTO(
            fileName: basename($filePath),
            fileType: 'sisu',
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
