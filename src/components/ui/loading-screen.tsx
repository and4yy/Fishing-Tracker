import React from 'react';

interface LoadingScreenProps {
  isLoading: boolean;
  children: React.ReactNode;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ isLoading, children }) => {
  if (!isLoading) return <>{children}</>;

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-8 animate-fade-in">
        <div className="relative">
          <img 
            src="/lovable-uploads/f4de85e3-f4f4-43d6-8017-db15188787eb.png" 
            alt="Fishing Reel"
            className="w-32 h-32 animate-spin animate-scale-in"
            style={{ animationDuration: '3s' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full animate-pulse"></div>
        </div>
        <div className="text-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <h2 className="text-2xl font-bold text-foreground mb-2 animate-fade-in">Fishing Tracker</h2>
          <p className="text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.7s' }}>
            Reeling in your fishing adventures...
          </p>
          <div className="flex justify-center mt-4">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};