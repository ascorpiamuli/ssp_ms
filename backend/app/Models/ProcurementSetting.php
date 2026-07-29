<?php
// app/Models/ProcurementSetting.php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProcurementSetting extends Model
{
  use HasFactory;

  /**
   * The attributes that are mass assignable.
   *
   * @var array<int, string>
   */
  protected $fillable = [
    'setting_key',
    'setting_group',
    'setting_value',
    'data_type',
    'is_encrypted',
    'description',
    'validation_rules',
    'options',
    'is_active',
    'updated_by',
    'metadata',
  ];

  /**
   * The attributes that should be cast.
   *
   * @var array<string, string>
   */
  protected $casts = [
    'setting_value' => 'string',
    'is_encrypted' => 'boolean',
    'is_active' => 'boolean',
    'validation_rules' => 'json',
    'options' => 'json',
    'metadata' => 'json',
    'created_at' => 'datetime',
    'updated_at' => 'datetime',
  ];

  /**
   * The accessors to append to the model's array form.
   *
   * @var array<int, string>
   */
  protected $appends = [
    'formatted_value',
    'is_boolean',
    'is_numeric',
    'is_json',
    'data_type_label',
  ];

  // ============================================
  // RELATIONSHIPS
  // ============================================

  public function updatedBy(): BelongsTo
  {
    return $this->belongsTo(User::class, 'updated_by');
  }

  // ============================================
  // ACCESSORS & MUTATORS
  // ============================================

  public function getFormattedValueAttribute()
  {
    $value = $this->setting_value;

    if ($this->is_encrypted) {
      return 'encrypted';
    }

    switch ($this->data_type) {
      case 'boolean':
        return filter_var($value, FILTER_VALIDATE_BOOLEAN);
      case 'integer':
        return (int) $value;
      case 'float':
        return (float) $value;
      case 'json':
        return json_decode($value, true);
      default:
        return $value;
    }
  }

  public function getIsBooleanAttribute(): bool
  {
    return $this->data_type === 'boolean';
  }

  public function getIsNumericAttribute(): bool
  {
    return in_array($this->data_type, ['integer', 'float']);
  }

  public function getIsJsonAttribute(): bool
  {
    return $this->data_type === 'json';
  }

  public function getDataTypeLabelAttribute(): string
  {
    $labels = [
      'string' => 'Text',
      'boolean' => 'Yes/No',
      'integer' => 'Number',
      'float' => 'Decimal',
      'json' => 'JSON',
      'email' => 'Email',
      'url' => 'URL',
      'textarea' => 'Long Text',
    ];

    return $labels[$this->data_type] ?? ucfirst($this->data_type ?? 'Unknown');
  }

  /**
   * Set setting_key to lowercase with underscores.
   */
  public function setSettingKeyAttribute(string $value): void
  {
    $this->attributes['setting_key'] = strtolower(preg_replace('/[^a-zA-Z0-9_]/', '_', trim($value)));
  }

  /**
   * Encrypt value if needed.
   */
  public function setSettingValueAttribute($value): void
  {
    if ($this->is_encrypted) {
      $this->attributes['setting_value'] = encrypt($value);
    } else {
      $this->attributes['setting_value'] = $value;
    }
  }

  /**
   * Decrypt value if needed.
   */
  public function getSettingValueAttribute($value): ?string
  {
    if ($this->is_encrypted && $value) {
      try {
        return decrypt($value);
      } catch (\Exception $e) {
        return null;
      }
    }
    return $value;
  }

  // ============================================
  // SCOPES
  // ============================================

  public function scopeActive($query)
  {
    return $query->where('is_active', true);
  }

  public function scopeByGroup($query, string $group)
  {
    return $query->where('setting_group', $group);
  }

  public function scopeByKey($query, string $key)
  {
    return $query->where('setting_key', $key);
  }

  public function scopeString($query)
  {
    return $query->where('data_type', 'string');
  }

  public function scopeBoolean($query)
  {
    return $query->where('data_type', 'boolean');
  }

  public function scopeNumeric($query)
  {
    return $query->whereIn('data_type', ['integer', 'float']);
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  public function getTypedValue()
  {
    return $this->formatted_value;
  }

  public function getOptions(): array
  {
    return $this->options ?? [];
  }

  public function validate($value): bool
  {
    $rules = $this->validation_rules ?? [];

    if (empty($rules)) {
      return true;
    }

    // Basic validation
    foreach ($rules as $rule => $params) {
      switch ($rule) {
        case 'min':
          if ($value < $params) return false;
          break;
        case 'max':
          if ($value > $params) return false;
          break;
        case 'in':
          if (!in_array($value, $params)) return false;
          break;
        case 'regex':
          if (!preg_match($params, $value)) return false;
          break;
        case 'email':
          if (!filter_var($value, FILTER_VALIDATE_EMAIL)) return false;
          break;
        case 'url':
          if (!filter_var($value, FILTER_VALIDATE_URL)) return false;
          break;
      }
    }

    return true;
  }

  public function isEncrypted(): bool
  {
    return (bool) $this->is_encrypted;
  }

  public function isActive(): bool
  {
    return (bool) $this->is_active;
  }

  public function activate(): self
  {
    $this->update(['is_active' => true]);
    return $this;
  }

  public function deactivate(): self
  {
    $this->update(['is_active' => false]);
    return $this;
  }

  public static function getValue(string $key, $default = null)
  {
    $setting = self::active()->byKey($key)->first();
    return $setting ? $setting->getTypedValue() : $default;
  }

  public static function setValue(string $key, $value, ?string $group = null, ?string $dataType = null): self
  {
    $setting = self::byKey($key)->first();

    if (!$setting) {
      $setting = new self();
      $setting->setting_key = $key;
      $setting->setting_group = $group ?? 'general';
      $setting->data_type = $dataType ?? 'string';
    }

    $setting->setting_value = $value;
    $setting->updated_by = auth()->id();
    $setting->save();

    return $setting;
  }

  public static function getGroup(string $group): array
  {
    return self::active()->byGroup($group)
      ->get()
      ->mapWithKeys(function ($setting) {
        return [$setting->setting_key => $setting->getTypedValue()];
      })
      ->toArray();
  }

  public static function getAllSettings(): array
  {
    return self::active()
      ->get()
      ->groupBy('setting_group')
      ->map(function ($settings) {
        return $settings->mapWithKeys(function ($setting) {
          return [$setting->setting_key => $setting->getTypedValue()];
        })->toArray();
      })
      ->toArray();
  }

  public function logActivity(string $action, ?array $oldValues = null, ?array $newValues = null, ?string $comment = null): void
  {
    ProcurementHistory::create([
      'requisition_id' => null,
      'user_id' => auth()->id(),
      'action' => $action,
      'entity_type' => 'procurement_setting',
      'entity_id' => $this->id,
      'old_values' => $oldValues,
      'new_values' => $newValues,
      'comment' => $comment,
      'ip_address' => request()->ip(),
      'user_agent' => request()->userAgent(),
    ]);
  }
}
