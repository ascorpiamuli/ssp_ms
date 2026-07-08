import { privateApi } from './api';
import { User } from '../types/auth.types';

export interface Profile {
  id: number;
  user_id: number;
  avatar?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  bio?: string;
  preferences?: Record<string, any>;
  social_links?: Record<string, string>;
}

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  id_number?: string;
  date_of_birth?: string;
  profile?: Partial<Profile>;
}

export class ProfileService {
  /**
   * Get authenticated user profile
   */
  static async getProfile(): Promise<{ success: boolean; data: User }> {
    return privateApi.get('/profile');
  }

  /**
   * Update profile
   */
  static async updateProfile(data: UpdateProfileData): Promise<{ success: boolean; data: User }> {
    return privateApi.put('/profile', data);
  }

  /**
   * Upload profile photo
   */
  static async uploadPhoto(file: File): Promise<{ success: boolean; data: { avatar: string } }> {
    const formData = new FormData();
    formData.append('avatar', file);
    return privateApi.post('/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Delete profile photo
   */
  static async deletePhoto(): Promise<{ success: boolean; message: string }> {
    return privateApi.delete('/profile/photo');
  }

  /**
   * Get profile completion status
   */
  static async getCompletionStatus(): Promise<{ success: boolean; data: { percentage: number; is_complete: boolean; missing_fields: string[] } }> {
    return privateApi.get('/profile/completion');
  }
}
