<?php

namespace App\Presentation\Http\Controllers;

use App\Application\Services\StudentImportService;
use App\Application\Services\SisuImportService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ImportController
{
    public function __construct(
        private readonly StudentImportService $studentImport,
        private readonly SisuImportService $sisuImport,
    ) {}

    public function importChromos(Request $request): JsonResponse
    {
        $path = $request->input('path') ?? config('edumatch.import_paths.chromos');

        try {
            $report = $this->studentImport->import($path);
            return response()->json([
                'message' => 'Importação do Chromos concluída com sucesso',
                'report' => $report->toArray(),
            ]);
        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function importSisu(Request $request): JsonResponse
    {
        $path = $request->input('path') ?? config('edumatch.import_paths.sisu');

        try {
            $report = $this->sisuImport->import($path);
            return response()->json([
                'message' => 'Importação do SISU concluída com sucesso',
                'report' => $report->toArray(),
            ]);
        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
}
