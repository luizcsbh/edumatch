<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dataset_versions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('version')->unique();
            $table->unsignedInteger('records');
            $table->unsignedInteger('positive');
            $table->unsignedInteger('negative');
            $table->unsignedInteger('hard_negative');
            $table->unsignedInteger('train');
            $table->unsignedInteger('validation');
            $table->unsignedInteger('test');
            $table->integer('random_seed')->default(42);
            $table->string('feature_version')->default('1.0.0');
            $table->json('source_versions');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dataset_versions');
    }
};
