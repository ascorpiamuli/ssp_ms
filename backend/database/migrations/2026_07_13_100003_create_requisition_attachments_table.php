<?php
// database/migrations/2026_07_13_100002_create_requisition_attachments_table.php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('requisition_attachments', function (Blueprint $table): void {
      $table->id();
      $table->unsignedBigInteger('requisition_id');
      $table->unsignedBigInteger('upload_id');
      $table->unsignedBigInteger('uploaded_by');
      $table->unsignedBigInteger('parent_id')->nullable();

      // Foreign keys
      $table->foreign('requisition_id')->references('id')->on('requisitions')->cascadeOnDelete();
      $table->foreign('upload_id')->references('id')->on('uploads')->cascadeOnDelete();
      $table->foreign('uploaded_by')->references('id')->on('users')->cascadeOnDelete();
      $table->foreign('parent_id')->references('id')->on('requisition_attachments')->nullOnDelete();

      // === ATTACHMENT DETAILS ===
      $table->string('file_name');
      $table->string('file_path');
      $table->string('file_type')->nullable();
      $table->bigInteger('file_size')->nullable();
      $table->string('mime_type')->nullable();
      $table->string('file_hash')->nullable();

      // === CATEGORY ===
      $table->enum('category', [
        'quotation',
        'specification',
        'justification',
        'approval_document',
        'budget_document',
        'invoice',
        'receipt',
        'contract',
        'other'
      ])->default('other');

      $table->text('description')->nullable();
      $table->boolean('is_required')->default(false);
      $table->boolean('is_verified')->default(false);

      // === VERSION CONTROL ===
      $table->integer('version')->default(1);

      // === TIMESTAMPS ===
      $table->timestamp('uploaded_at')->useCurrent();
      $table->softDeletes();
      $table->timestamps();

      // === INDEXES ===
      $table->index(['requisition_id', 'category']);
      $table->index('uploaded_by');
      $table->index('file_hash');
      $table->index('is_verified');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('requisition_attachments');
  }
};
