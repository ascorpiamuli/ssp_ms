<?php
// app/Services/Procurement/Repositories/BaseRepository.php

declare(strict_types=1);

namespace App\Services\Procurement\Repositories;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

abstract class BaseRepository
{
  protected Model $model;

  public function __construct(Model $model)
  {
    $this->model = $model;
  }

  public function find(int $id): ?Model
  {
    return $this->model->find($id);
  }

  public function findOrFail(int $id): Model
  {
    return $this->model->findOrFail($id);
  }

  public function all(): Collection
  {
    return $this->model->all();
  }

  public function paginate(int $perPage = 15): LengthAwarePaginator
  {
    return $this->model->paginate($perPage);
  }

  public function create(array $data): Model
  {
    return $this->model->create($data);
  }

  public function update(int $id, array $data): Model
  {
    $model = $this->findOrFail($id);
    $model->update($data);
    return $model;
  }

  public function delete(int $id): bool
  {
    $model = $this->findOrFail($id);
    return $model->delete();
  }

  public function beginTransaction(): void
  {
    DB::beginTransaction();
  }

  public function commit(): void
  {
    DB::commit();
  }

  public function rollback(): void
  {
    DB::rollBack();
  }
}
