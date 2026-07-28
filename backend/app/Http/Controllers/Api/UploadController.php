<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UploadRequest;
use App\Http\Resources\UploadResource;
use App\Models\Upload;
use App\Services\UploadService;
use Illuminate\Http\Request;

class UploadController extends Controller
{
  protected UploadService $uploadService;

  public function __construct(UploadService $uploadService)
  {
    $this->uploadService = $uploadService;
  }

  /**
   * Upload a file.
   */
  public function upload(UploadRequest $request)
  {
    try {
      $file = $request->file('file');
      $collection = $request->input('collection', 'default');
      $title = $request->input('title');
      $description = $request->input('description');

      // Get uploadable model if specified
      $uploadable = null;
      if ($request->has('uploadable_type') && $request->has('uploadable_id')) {
        $modelClass = $request->input('uploadable_type');
        $modelId = $request->input('uploadable_id');
        $uploadable = $modelClass::find($modelId);
      }

      $upload = $this->uploadService->upload(
        $file,
        $uploadable,
        $collection,
        $title,
        $description
      );

      return response()->json([
        'success' => true,
        'message' => 'File uploaded successfully',
        'data' => new UploadResource($upload),
      ], 201);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to upload file: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get all uploads.
   */
  public function index(Request $request)
  {
    $query = Upload::with('uploadedBy');

    // Filter by collection
    if ($request->has('collection')) {
      $query->where('collection', $request->collection);
    }

    // Filter by file type
    if ($request->has('file_type')) {
      $query->where('file_type', $request->file_type);
    }

    // Filter by uploadable model
    if ($request->has('uploadable_type') && $request->has('uploadable_id')) {
      $query->where('uploadable_type', $request->uploadable_type)
        ->where('uploadable_id', $request->uploadable_id);
    }

    $uploads = $query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 20);

    return response()->json([
      'success' => true,
      'data' => UploadResource::collection($uploads),
      'meta' => [
        'total' => $uploads->total(),
        'per_page' => $uploads->perPage(),
        'current_page' => $uploads->currentPage(),
        'last_page' => $uploads->lastPage(),
      ],
    ]);
  }

  /**
   * Get a specific upload.
   */
  public function show($id)
  {
    $upload = Upload::with('uploadedBy')->find($id);

    if (!$upload) {
      return response()->json([
        'success' => false,
        'message' => 'Upload not found',
      ], 404);
    }

    return response()->json([
      'success' => true,
      'data' => new UploadResource($upload),
    ]);
  }

  /**
   * Get uploads for a specific model.
   */
  public function getForModel(Request $request)
  {
    $request->validate([
      'uploadable_type' => 'required|string',
      'uploadable_id' => 'required|integer',
      'collection' => 'nullable|string',
    ]);

    $modelClass = $request->uploadable_type;
    $model = $modelClass::find($request->uploadable_id);

    if (!$model) {
      return response()->json([
        'success' => false,
        'message' => 'Model not found',
      ], 404);
    }

    $uploads = $this->uploadService->getUploadsForModel($model, $request->collection);

    return response()->json([
      'success' => true,
      'data' => UploadResource::collection($uploads),
    ]);
  }

  /**
   * Delete an upload.
   */
  public function destroy($id)
  {
    $upload = Upload::find($id);

    if (!$upload) {
      return response()->json([
        'success' => false,
        'message' => 'Upload not found',
      ], 404);
    }

    // Check permission - only owner or admin can delete
    if ($upload->uploaded_by !== auth()->id() && !auth()->user()->hasRole('ADMIN')) {
      return response()->json([
        'success' => false,
        'message' => 'You do not have permission to delete this file',
      ], 403);
    }

    try {
      $this->uploadService->delete($upload);

      return response()->json([
        'success' => true,
        'message' => 'File deleted successfully',
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to delete file: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Attach upload to a model.
   */
  public function attach(Request $request, $id)
  {
    $request->validate([
      'uploadable_type' => 'required|string',
      'uploadable_id' => 'required|integer',
    ]);

    $upload = Upload::find($id);

    if (!$upload) {
      return response()->json([
        'success' => false,
        'message' => 'Upload not found',
      ], 404);
    }

    $modelClass = $request->uploadable_type;
    $model = $modelClass::find($request->uploadable_id);

    if (!$model) {
      return response()->json([
        'success' => false,
        'message' => 'Model not found',
      ], 404);
    }

    $this->uploadService->attachToModel($upload, $model);

    return response()->json([
      'success' => true,
      'message' => 'File attached successfully',
      'data' => new UploadResource($upload),
    ]);
  }
}
