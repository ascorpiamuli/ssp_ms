// src/components/profile/ProfileField.tsx
import { ElementType } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pencil, Check, X } from 'lucide-react';

interface ProfileFieldProps {
  label: string;
  value: any;
  icon: ElementType;
  field: string;
  name?: string; // Added name prop for form identification
  isEditing: boolean;
  onChange?: (field: string, value: any) => void;
  onSave?: () => void;
  onCancel?: () => void;
  type?: 'text' | 'email' | 'tel' | 'url' | 'date' | 'select' | 'textarea';
  options?: { value: string; label: string }[];
  placeholder?: string;
  readonly?: boolean;
  disabled?: boolean;
  required?: boolean; // Added required prop
  min?: number | string; // Added min for number inputs
  max?: number | string; // Added max for number inputs
  step?: number | string; // Added step for number inputs
  pattern?: string; // Added pattern for regex validation
}

export default function ProfileField({
  label,
  value,
  icon: Icon,
  field,
  name,
  isEditing,
  onChange,
  onSave,
  onCancel,
  type = 'text',
  options = [],
  placeholder = '',
  readonly = false,
  disabled = false,
  required = false,
  min,
  max,
  step,
  pattern,
}: ProfileFieldProps) {
  const handleChange = (newValue: any) => {
    if (onChange) {
      onChange(field, newValue);
    }
  };

  const renderInput = () => {
    if (type === 'select') {
      // Filter out duplicate values and ensure each option has a unique key
      const uniqueOptions = options.filter((opt, index, self) =>
        index === self.findIndex(o => o.value === opt.value)
      );

      return (
        <select
          name={name || field}
          data-field={field}
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          disabled={!isEditing || readonly || disabled}
          required={required}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 disabled:opacity-50 focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all"
        >
          <option value="">Select {label}</option>
          {uniqueOptions.map((opt, idx) => (
            <option key={`${opt.value}-${idx}`} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    if (type === 'textarea') {
      return (
        <textarea
          name={name || field}
          data-field={field}
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          disabled={!isEditing || readonly || disabled}
          placeholder={placeholder}
          required={required}
          rows={3}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 disabled:opacity-50 focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all"
        />
      );
    }

    return (
      <Input
        type={type}
        name={name || field}
        data-field={field}
        value={value || ''}
        onChange={(e) => handleChange(e.target.value)}
        disabled={!isEditing || readonly || disabled}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        step={step}
        pattern={pattern}
        className="disabled:opacity-50 focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all"
      />
    );
  };

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
          <Icon className="h-4 w-4 text-gray-400" />
        </div>
        <div className="pl-9">
          {renderInput()}
        </div>
      </div>
      {isEditing && onSave && onCancel && (
        <div className="flex gap-2 mt-2">
          <Button
            type="button"
            size="sm"
            onClick={onSave}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            <Check className="h-3 w-3 mr-1" />
            Save
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onCancel}
          >
            <X className="h-3 w-3 mr-1" />
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
