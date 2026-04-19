import React from 'react';
import { Menu } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-white py-2.5 px-4 border-b border-gray-100 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <Menu className="text-vivo-purple" size={20} />
        <div className="flex items-center h-6">
          <img 
            src="/logo-vivo.png" 
            alt="Vivo Logo" 
            className="h-full w-auto object-contain"
          />
        </div>
      </div>
      
      <button className="text-vivo-purple font-bold text-[11px] uppercase tracking-wider">
        Entrar
      </button>
    </header>
  );
};
