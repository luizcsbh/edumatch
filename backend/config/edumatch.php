<?php

return [
    'match_threshold' => (float) env('EDUMATCH_MATCH_THRESHOLD', 0.90),
    'no_match_threshold' => (float) env('EDUMATCH_NO_MATCH_THRESHOLD', 0.30),
    'ml_service_url' => env('EDUMATCH_ML_SERVICE_URL', 'http://matching-ml-service:3001'),
    'import_paths' => [
        'chromos' => env('CHROMOS_FILE_PATH', base_path('../lista-alunos-chromos-normalizada.csv')),
        'sisu' => env('SISU_FILE_PATH', base_path('../8a-Chamada-da-Lista-de-Espera-SISU-2026.xlsx')),
    ],
];
