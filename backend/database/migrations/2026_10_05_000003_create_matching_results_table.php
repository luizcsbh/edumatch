<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('matching_results', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('student_id');
            $table->uuid('sisu_candidate_id');
            $table->decimal('probability', 6, 4);
            $table->string('decision')->index(); // MATCH, NO_MATCH, HUMAN_REVIEW
            $table->string('model_version');
            $table->string('dataset_version');
            $table->json('features');
            $table->timestamps();

            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
            $table->foreign('sisu_candidate_id')->references('id')->on('sisu_candidates')->onDelete('cascade');
            $table->unique(['student_id', 'sisu_candidate_id'], 'pair_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('matching_results');
    }
};
