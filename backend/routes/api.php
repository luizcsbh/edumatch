<?php

use Illuminate\Support\Facades\Route;
use App\Presentation\Http\Controllers\StudentController;
use App\Presentation\Http\Controllers\SisuCandidateController;
use App\Presentation\Http\Controllers\MatchingController;
use App\Presentation\Http\Controllers\HumanReviewController;
use App\Presentation\Http\Controllers\DatasetController;
use App\Presentation\Http\Controllers\ImportController;

Route::prefix('v1')->group(function () {
    // Health Check
    Route::get('/health', fn() => response()->json(['status' => 'UP', 'app' => 'EduMatch Backend']));

    // Students
    Route::get('/students', [StudentController::class, 'index']);
    Route::get('/students/{id}', [StudentController::class, 'show']);

    // SISU Candidates
    Route::get('/candidates', [SisuCandidateController::class, 'index']);
    Route::get('/candidates/{id}', [SisuCandidateController::class, 'show']);

    // Matching
    Route::post('/match/candidate/{id}', [MatchingController::class, 'matchCandidate']);
    Route::get('/match/pending-reviews', [MatchingController::class, 'getPendingReviews']);

    // Human Review
    Route::post('/review/{id}', [HumanReviewController::class, 'submitReview']);

    // Dataset & ML Model
    Route::get('/dataset/latest', [DatasetController::class, 'latestVersion']);
    Route::get('/dataset/pending-candidates', [DatasetController::class, 'pendingCandidates']);
    Route::get('/model/active', [DatasetController::class, 'activeModel']);

    // Imports
    Route::post('/import/chromos', [ImportController::class, 'importChromos']);
    Route::post('/import/sisu', [ImportController::class, 'importSisu']);
});
