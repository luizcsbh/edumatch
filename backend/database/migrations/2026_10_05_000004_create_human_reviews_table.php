<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('human_reviews', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('matching_result_id');
            $table->string('reviewed_by');
            $table->timestamp('reviewed_at');
            $table->string('decision'); // MATCH, NO_MATCH
            $table->text('comment')->nullable();
            $table->timestamps();

            $table->foreign('matching_result_id')->references('id')->on('matching_results')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('human_reviews');
    }
};
