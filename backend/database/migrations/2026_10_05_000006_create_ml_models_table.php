<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ml_models', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('version')->unique();
            $table->string('dataset_version');
            $table->string('feature_version')->default('1.0.0');
            $table->string('algorithm_version')->default('1.0.0');
            $table->decimal('accuracy', 6, 4)->nullable();
            $table->decimal('precision_score', 6, 4)->nullable();
            $table->decimal('recall', 6, 4)->nullable();
            $table->decimal('f1_score', 6, 4)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ml_models');
    }
};
