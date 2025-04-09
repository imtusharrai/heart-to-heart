'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleLogout}
      className="gap-2"
    >
      <LogOut className="h-4 w-4" />
      <span>Logout</span>
    </Button>
  );
}