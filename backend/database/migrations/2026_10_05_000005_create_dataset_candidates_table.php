<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dataset_candidates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('student_name');
            $table->string('candidate_name');
            $table->string('normalized_student_name');
            $table->string('normalized_candidate_name');
            $table->json('features');
            $table->tinyInteger('label'); // 0 or 1
            $table->string('status')->default('PENDING')->index(); // PENDING, APPROVED, REJECTED
            $table->string('source')->default('human_review');
            $table->string('reviewed_by')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dataset_candidates');
    }
};
