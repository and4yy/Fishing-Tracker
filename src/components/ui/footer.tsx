import React from 'react';
import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-background border-t border-border mt-auto pb-20">
      <div className="container mx-auto px-4 py-6">
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
                <div className="w-6 h-4 bg-gradient-to-b from-red-500 via-red-500 to-green-600 rounded-sm border border-gray-300 shadow-sm relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-white flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-green-600"></div>
                    </div>
                  </div>
                </div>
                <span className="font-medium text-foreground">Maldives</span>
              </div>
            </div>
          </div>
          <div className="text-center text-xs text-muted-foreground">
            © 2024 Fishing Tracker. Made for fishermen by fishermen.
          </div>
        </div>
      </div>
    </footer>
  );
}