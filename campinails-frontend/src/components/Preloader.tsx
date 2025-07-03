import React from 'react';
import { Sparkles, Heart, Star } from 'lucide-react';

interface PreloaderProps {
  message?: string;
}

export const Preloader: React.FC<PreloaderProps> = ({ 
  message = "Preparando tu experiencia perfecta..." 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-pink-300/20 to-rose-300/20 rounded-full blur-2xl animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-40 h-40 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-br from-rose-300/10 to-purple-300/10 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      <div className="relative z-10 text-center">
        {/* Main logo/icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-pink-500 to-rose-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl animate-pulse">
            <Sparkles className="w-12 h-12 text-white animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          
          {/* Floating elements around logo */}
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}>
            <Heart className="w-4 h-4 text-white m-1" />
          </div>
          <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full animate-bounce" style={{ animationDelay: '1s' }}>
            <Star className="w-4 h-4 text-white m-1" />
          </div>
          <div className="absolute top-1/2 -right-8 w-4 h-4 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full animate-ping"></div>
          <div className="absolute top-1/2 -left-8 w-4 h-4 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full animate-ping" style={{ animationDelay: '0.7s' }}></div>
        </div>

        {/* Brand name */}
        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-2">
          Campi Nails
        </h1>
        
        {/* Loading message */}
        <p className="text-gray-600 text-lg font-medium mb-8 animate-pulse">
          {message}
        </p>

        {/* Loading animation */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-gradient-to-r from-rose-500 to-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>

        {/* Progress bar */}
        <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full animate-pulse"></div>
        </div>

        {/* Subtle loading text */}
        <p className="text-gray-400 text-sm mt-6 animate-pulse">
          Cargando servicios y horarios disponibles...
        </p>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full opacity-60 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};