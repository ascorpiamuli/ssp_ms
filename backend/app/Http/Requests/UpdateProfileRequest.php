<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    $userId = $this->user()->id;

    return [
      // User fields
      'first_name' => 'sometimes|string|max:255',
      'last_name' => 'sometimes|string|max:255',
      'phone' => ['sometimes', 'string', 'max:20', Rule::unique('users')->ignore($userId)],
      'id_number' => 'nullable|string|max:50',
      'date_of_birth' => 'nullable|date',

      // Profile fields
      'profile.gender' => 'nullable|string|in:male,female,other',
      'profile.address' => 'nullable|string|max:500',
      'profile.city' => 'nullable|string|max:255',
      'profile.state' => 'nullable|string|max:255',
      'profile.postal_code' => 'nullable|string|max:20',
      'profile.country' => 'nullable|string|max:255',
      'profile.bio' => 'nullable|string|max:500',
      'profile.preferences' => 'nullable|array',
      'profile.social_links' => 'nullable|array',

      // Avatar upload
      'avatar' => 'nullable|image|max:2048|mimes:jpeg,png,jpg,gif,svg',
    ];
  }

  public function messages(): array
  {
    return [
      'phone.unique' => 'This phone number is already in use',
      'date_of_birth.date' => 'Please enter a valid date of birth',
      'profile.gender.in' => 'Invalid gender selection',
      'avatar.image' => 'Please upload a valid image file',
      'avatar.max' => 'Avatar image must be less than 2MB',
      'avatar.mimes' => 'Avatar must be a JPEG, PNG, JPG, GIF, or SVG file',
    ];
  }
}
