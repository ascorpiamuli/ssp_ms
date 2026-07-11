<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_activity_logs', function (Blueprint $table) {
            if (!Schema::hasColumn('user_activity_logs', 'entity_type')) {
                $table->string('entity_type')->nullable()->after('module');
            }
            if (!Schema::hasColumn('user_activity_logs', 'entity_id')) {
                $table->unsignedBigInteger('entity_id')->nullable()->after('entity_type');
            }
            if (!Schema::hasColumn('user_activity_logs', 'old_values')) {
                $table->json('old_values')->nullable()->after('data');
            }
            if (!Schema::hasColumn('user_activity_logs', 'new_values')) {
                $table->json('new_values')->nullable()->after('old_values');
            }
            if (!Schema::hasColumn('user_activity_logs', 'metadata')) {
                $table->json('metadata')->nullable()->after('new_values');
            }
        });
    }

    public function down(): void
    {
        Schema::table('user_activity_logs', function (Blueprint $table) {
            $columns = ['entity_type', 'entity_id', 'old_values', 'new_values', 'metadata'];
            foreach ($columns as $column) {
                if (Schema::hasColumn('user_activity_logs', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
