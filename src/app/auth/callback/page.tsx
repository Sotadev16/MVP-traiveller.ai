"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the auth callback from hash fragments
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth error:', error);
          router.push('/admin?error=auth_failed');
          return;
        }

        if (data.session) {
          // User is authenticated, redirect to admin
          router.push('/admin');
        } else {
          // No session, redirect to admin login
          router.push('/admin');
        }
      } catch (error) {
        console.error('Callback error:', error);
        router.push('/admin?error=callback_failed');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing login...</p>
      </div>
    </div>
  );
}