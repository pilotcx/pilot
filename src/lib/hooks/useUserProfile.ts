import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import apiService from '@/lib/services/api';
import { UpdateUserSchema } from '@/lib/validations/user';
import { User } from '@/lib/types/models/user';

export function useUserProfile() {
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.getUserProfile();
      setProfile(response.data);
    } catch (err) {
      setError('Failed to load profile data');
      toast.error('Failed to load profile data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: UpdateUserSchema) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await apiService.updateUserProfile(data);
      setProfile(response.data);
      toast.success('Profile updated successfully!');
      return true;
    } catch (err: any) {
      const message = err.message || 'Failed to update profile';
      setError(message);
      toast.error(message);
      console.error(err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    isLoading,
    error,
    isSubmitting,
    fetchProfile,
    updateProfile,
  };
} 