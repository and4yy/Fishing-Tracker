import React from 'react';

interface LoadingScreenProps {
  isLoading: boolean;
  children: React.ReactNode;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ isLoading, children }) => {
  if (!isLoading) return <>{children}</>;

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          <img 
            src="/lovable-uploads/82d6d9db-4b2b-44ee-af60-2fbfac5b3428.png" 
            alt="Fishing Tracker Logo"
            className="w-24 h-24 animate-pulse"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full animate-spin opacity-50"></div>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Fishing Tracker</h2>
          <p className="text-sm text-muted-foreground">Loading your fishing adventures...</p>
        </div>
      </div>
    </div>
  );
};