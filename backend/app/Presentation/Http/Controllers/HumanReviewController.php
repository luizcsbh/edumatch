<?php

namespace App\Presentation\Http\Controllers;

use App\Application\Services\HumanReviewService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class HumanReviewController
{
    public function __construct(
        private readonly HumanReviewService $reviewService
    ) {}

    public function submitReview(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'decision' => 'required|in:MATCH,NO_MATCH',
            'reviewed_by' => 'required|string',
            'comment' => 'nullable|string',
        ]);

        try {
            $review = $this->reviewService->submitReview(
                matchingResultId: $id,
                decisionStr: $validated['decision'],
                reviewedBy: $validated['reviewed_by'],
                comment: $validated['comment'] ?? null,
            );

            return response()->json([
                'message' => 'Revisão registrada com sucesso e enviada para dataset candidates.',
                'review_id' => $review->id,
                'decision' => $review->decision->value,
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }
}
