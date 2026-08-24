// ==========================================
// ThreadFlow — Settings Page
// ==========================================

'use client';

import { useSession } from 'next-auth/react';
import PageContainer from '@/components/layout/PageContainer';
import Card from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <PageContainer
      title="Settings"
      description="Manage your account preferences"
    >
      <div className="max-w-2xl">
        <Card>
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 border-b border-[var(--color-border-default)] pb-4">
            Profile Information
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Full Name" 
                value={session?.user?.name || ''} 
                readOnly
              />
              <Input 
                label="Email Address" 
                value={session?.user?.email || ''} 
                readOnly
              />
            </div>
            <Input 
              label="Role" 
              value={(session?.user?.role || '').charAt(0).toUpperCase() + (session?.user?.role || '').slice(1)} 
              readOnly
            />
          </div>
          
          <div className="mt-6 pt-6 border-t border-[var(--color-border-default)] flex justify-end">
            <Button disabled>Save Changes</Button>
          </div>
        </Card>
        
        <p className="mt-4 text-xs text-[var(--color-text-muted)] text-center">
          Note: This is a demo environment. Profile updates are disabled.
        </p>
      </div>
    </PageContainer>
  );
}
