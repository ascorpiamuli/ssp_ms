import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProfileService, UpdateProfileData } from '@/services/profile.service';

export function useProfile() {
  const queryClient = useQueryClient();

  // Query: Get profile
  const useGetProfile = () => {
    return useQuery({
      queryKey: ['profile'],
      queryFn: ProfileService.getProfile,
      staleTime: 5 * 60 * 1000,
    });
  };

  // Query: Get completion status
  const useCompletionStatus = () => {
    return useQuery({
      queryKey: ['profile', 'completion'],
      queryFn: ProfileService.getCompletionStatus,
      staleTime: 2 * 60 * 1000,
    });
  };

  // Mutation: Update profile
  const updateProfile = useMutation({
    mutationFn: (data: UpdateProfileData) => ProfileService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  // Mutation: Upload photo
  const uploadPhoto = useMutation({
    mutationFn: (file: File) => ProfileService.uploadPhoto(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  // Mutation: Delete photo
  const deletePhoto = useMutation({
    mutationFn: ProfileService.deletePhoto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  return {
    useGetProfile,
    useCompletionStatus,
    updateProfile,
    uploadPhoto,
    deletePhoto,
  };
}
