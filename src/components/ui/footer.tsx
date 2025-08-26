import React from 'react';
import { Heart } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export function Footer() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  return (
    <footer className="bg-background border-t border-border mt-auto pb-20">
      <div className="container mx-auto px-4 py-6">
        {isHomePage && (
          <div className="flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <div className="flex items-center gap-2">
                <span>Crafted with</span>
                <Heart className="h-4 w-4 text-red-500 fill-current" />
                <span>by</span>
                <span className="font-semibold text-foreground">Anday</span>
              </div>
              <div className="flex items-center gap-2">
                <span>in</span>
                <div className="flex items-center gap-1">
                  <img 
                    src="/lovable-uploads/a80cb5d2-2131-4def-ac77-6a5b7f8d8f2d.png" 
                    alt="Maldives flag" 
                    className="w-6 h-4 rounded-sm border border-gray-300 shadow-sm object-cover"
                  />
                  <span className="font-medium text-foreground">Maldives</span>
                </div>
              </div>
            </div>
            <div className="text-center text-xs text-muted-foreground">
              © 2024 Fishing Tracker. Made for fishermen by fishermen.
            </div>
          </div>
        )}
      </div>
    </footer>
  );
}