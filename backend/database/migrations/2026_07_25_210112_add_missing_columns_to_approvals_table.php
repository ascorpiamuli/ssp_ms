<?php
// database/migrations/2024_01_XX_add_missing_columns_to_approvals_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::table('approvals', function (Blueprint $table) {
      // ✅ Add reason column if missing
      if (!Schema::hasColumn('approvals', 'reason')) {
        $table->text('reason')->nullable()->after('comment');
      }

      // ✅ Add order column if missing
      if (!Schema::hasColumn('approvals', 'order')) {
        $table->integer('order')->default(0)->after('level');
      }

      // ✅ Add level_name column if missing
      if (!Schema::hasColumn('approvals', 'level_name')) {
        $table->string('level_name')->nullable()->after('level');
      }

      // ✅ Add status_label column if missing
      if (!Schema::hasColumn('approvals', 'status_label')) {
        $table->string('status_label')->nullable()->after('status');
      }

      // ✅ Add original_approver_id column if missing
      if (!Schema::hasColumn('approvals', 'original_approver_id')) {
        $table->foreignId('original_approver_id')->nullable()->after('delegate_id')
          ->constrained('users')->nullOnDelete();
      }

      // ✅ Add delegated_at column if missing
      if (!Schema::hasColumn('approvals', 'delegated_at')) {
        $table->timestamp('delegated_at')->nullable()->after('delegated_at');
      }

      // ✅ Add received_at column if missing
      if (!Schema::hasColumn('approvals', 'received_at')) {
        $table->timestamp('received_at')->nullable()->after('assigned_at');
      }

      // ✅ Add response_time_hours column if missing
      if (!Schema::hasColumn('approvals', 'response_time_hours')) {
        $table->decimal('response_time_hours', 8, 2)->nullable()->after('reviewed_at');
      }

      // ✅ Add is_required column if missing
      if (!Schema::hasColumn('approvals', 'is_required')) {
        $table->boolean('is_required')->default(true)->after('is_delegated');
      }

      // ✅ Add escalated_at column if missing
      if (!Schema::hasColumn('approvals', 'escalated_at')) {
        $table->timestamp('escalated_at')->nullable()->after('due_date');
      }

      // ✅ Add escalation_count column if missing
      if (!Schema::hasColumn('approvals', 'escalation_count')) {
        $table->integer('escalation_count')->default(0)->after('escalated_at');
      }
    });
  }

  public function down(): void
  {
    Schema::table('approvals', function (Blueprint $table) {
      $columns = [
        'reason',
        'order',
        'level_name',
        'status_label',
        'original_approver_id',
        'delegated_at',
        'received_at',
        'response_time_hours',
        'is_required',
        'escalated_at',
        'escalation_count'
      ];

      foreach ($columns as $column) {
        if (Schema::hasColumn('approvals', $column)) {
          $table->dropColumn($column);
        }
      }
    });
  }
};
