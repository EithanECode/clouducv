import { Suspense } from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { AuthProvider } from '@/contexts/AuthContext';

export default function Page() {
  return (
    <AuthProvider>
      <Suspense fallback={null}>
        <AppLayout />
      </Suspense>
    </AuthProvider>
  );
}
