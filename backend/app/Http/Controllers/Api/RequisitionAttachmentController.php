<?php
// app/Http/Controllers/Api/RequisitionAttachmentController.php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\Requisition\RequisitionAttachmentResource;
use App\Models\Requisition;
use App\Models\RequisitionAttachment;
use App\Models\Upload;
use App\Exceptions\Requisitions\RequisitionException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class RequisitionAttachmentController extends Controller
{
  /**
   * Display a listing of attachments for a requisition.
   */
  public function index(int $requisitionId): JsonResponse
  {
    try {
      $requisition = Requisition::findOrFail($requisitionId);
      $attachments = $requisition->attachments()->with(['uploadedBy'])->get();

      return response()->json([
        'success' => true,
        'data' => RequisitionAttachmentResource::collection($attachments),
        'message' => 'Attachments retrieved successfully'
      ]);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Requisition not found'
      ], 404);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to retrieve attachments: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Store a newly created attachment.
   */
  public function store(Request $request, int $requisitionId): JsonResponse
  {
    try {
      $requisition = Requisition::findOrFail($requisitionId);

      $request->validate([
        'file' => ['required', 'file', 'max:10240'], // 10MB max
        'category' => ['nullable', 'in:quotation,specification,justification,approval_document,budget_document,invoice,receipt,contract,other'],
        'description' => ['nullable', 'string', 'max:1000'],
        'is_required' => ['nullable', 'boolean']
      ]);

      // Check if requisition can be modified
      if (!$requisition->isEditable) {
        throw new RequisitionException('Cannot add attachments to a requisition that is not editable');
      }

      $file = $request->file('file');
      $fileName = $file->getClientOriginalName();
      $fileSize = $file->getSize();
      $mimeType = $file->getMimeType();
      $fileExtension = $file->getClientOriginalExtension();

      // Generate unique file name
      $storedFileName = Str::uuid() . '.' . $fileExtension;
      $path = 'requisitions/' . $requisition->reference_number;

      // Store file
      $filePath = $file->storeAs($path, $storedFileName, 'public');

      // Create upload record
      $upload = Upload::create([
        'filename' => $storedFileName,
        'original_filename' => $fileName,
        'path' => $filePath,
        'mime_type' => $mimeType,
        'size' => $fileSize,
        'uploaded_by' => auth()->id(),
      ]);

      // Create attachment record
      $attachment = RequisitionAttachment::create([
        'requisition_id' => $requisitionId,
        'upload_id' => $upload->id,
        'uploaded_by' => auth()->id(),
        'file_name' => $fileName,
        'file_path' => $filePath,
        'file_size' => $fileSize,
        'mime_type' => $mimeType,
        'category' => $request->input('category', 'other'),
        'description' => $request->input('description'),
        'is_required' => $request->input('is_required', false),
        'uploaded_at' => now(),
      ]);

      // Log activity
      $requisition->logActivity(
        'attachment_added',
        null,
        ['attachment_id' => $attachment->id],
        'Attachment added: ' . $fileName
      );

      return response()->json([
        'success' => true,
        'data' => new RequisitionAttachmentResource($attachment->load(['uploadedBy'])),
        'message' => 'Attachment uploaded successfully'
      ], 201);
    } catch (RequisitionException $e) {
      return response()->json([
        'success' => false,
        'message' => $e->getMessage(),
        'errors' => $e->getContext()
      ], $e->getCode() ?: 400);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Requisition not found'
      ], 404);
    } catch (\Illuminate\Validation\ValidationException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Validation failed',
        'errors' => $e->errors()
      ], 422);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to upload attachment: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Display the specified attachment.
   */
  public function show(int $requisitionId, int $id): JsonResponse
  {
    try {
      $requisition = Requisition::findOrFail($requisitionId);
      $attachment = $requisition->attachments()->with(['uploadedBy', 'upload'])->findOrFail($id);

      return response()->json([
        'success' => true,
        'data' => new RequisitionAttachmentResource($attachment),
        'message' => 'Attachment retrieved successfully'
      ]);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Attachment not found'
      ], 404);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to retrieve attachment: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Download the specified attachment.
   */
  public function download(int $requisitionId, int $id)
  {
    try {
      $requisition = Requisition::findOrFail($requisitionId);
      $attachment = $requisition->attachments()->findOrFail($id);

      // Check if file exists
      if (!Storage::disk('public')->exists($attachment->file_path)) {
        return response()->json([
          'success' => false,
          'message' => 'File not found'
        ], 404);
      }

      // Log activity
      $requisition->logActivity(
        'attachment_downloaded',
        null,
        ['attachment_id' => $attachment->id],
        'Attachment downloaded: ' . $attachment->file_name
      );

      return Storage::disk('public')->download(
        $attachment->file_path,
        $attachment->file_name
      );
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Attachment not found'
      ], 404);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to download attachment: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Delete the specified attachment.
   */
  public function destroy(int $requisitionId, int $id): JsonResponse
  {
    try {
      $requisition = Requisition::findOrFail($requisitionId);
      $attachment = $requisition->attachments()->findOrFail($id);

      // Check if requisition can be modified
      if (!$requisition->isEditable) {
        throw new RequisitionException('Cannot delete attachments from a requisition that is not editable');
      }

      // Delete file from storage
      if (Storage::disk('public')->exists($attachment->file_path)) {
        Storage::disk('public')->delete($attachment->file_path);
      }

      // Delete upload record
      if ($attachment->upload_id) {
        Upload::where('id', $attachment->upload_id)->delete();
      }

      $fileName = $attachment->file_name;
      $attachment->delete();

      // Log activity
      $requisition->logActivity(
        'attachment_removed',
        null,
        ['attachment_id' => $id],
        'Attachment removed: ' . $fileName
      );

      return response()->json([
        'success' => true,
        'message' => 'Attachment deleted successfully'
      ]);
    } catch (RequisitionException $e) {
      return response()->json([
        'success' => false,
        'message' => $e->getMessage(),
        'errors' => $e->getContext()
      ], $e->getCode() ?: 400);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Attachment not found'
      ], 404);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to delete attachment: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Update attachment category/description.
   */
  public function update(Request $request, int $requisitionId, int $id): JsonResponse
  {
    try {
      $requisition = Requisition::findOrFail($requisitionId);
      $attachment = $requisition->attachments()->findOrFail($id);

      $request->validate([
        'category' => ['nullable', 'in:quotation,specification,justification,approval_document,budget_document,invoice,receipt,contract,other'],
        'description' => ['nullable', 'string', 'max:1000'],
        'is_required' => ['nullable', 'boolean']
      ]);

      $attachment->update($request->only(['category', 'description', 'is_required']));

      return response()->json([
        'success' => true,
        'data' => new RequisitionAttachmentResource($attachment->load(['uploadedBy'])),
        'message' => 'Attachment updated successfully'
      ]);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Attachment not found'
      ], 404);
    } catch (\Illuminate\Validation\ValidationException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Validation failed',
        'errors' => $e->errors()
      ], 422);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to update attachment: ' . $e->getMessage()
      ], 500);
    }
  }
}
