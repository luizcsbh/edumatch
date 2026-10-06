<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sisu_candidates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('normalized_name')->index();
            $table->string('enem_registration')->nullable()->index();
            $table->string('college')->nullable();
            $table->string('course')->nullable();
            $table->string('shift')->nullable();
            $table->string('classification')->nullable();
            $table->string('approved_shift')->nullable();
            $table->string('modality')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sisu_candidates');
    }
};
