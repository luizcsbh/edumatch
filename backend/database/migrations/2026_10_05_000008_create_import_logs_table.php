<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('import_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('file_name');
            $table->string('file_type'); // chromos, sisu
            $table->unsignedInteger('records_total')->default(0);
            $table->unsignedInteger('records_valid')->default(0);
            $table->unsignedInteger('records_invalid')->default(0);
            $table->unsignedInteger('empty_fields')->default(0);
            $table->unsignedInteger('duplicates')->default(0);
            $table->string('imported_by')->default('system');
            $table->timestamp('imported_at')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('import_logs');
    }
};
