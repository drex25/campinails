import React, { useEffect } from 'react';
import { X, Sparkles, Star, Heart } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-3xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={`relative w-full ${sizeClasses[size]} transform transition-all duration-300 scale-100 opacity-100`}
          onClick={(e) => e.stopPropagation()}
          style={{perspective: '1000px'}}
        >
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-white/50 relative transform transition-all duration-500">
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-pink-300/30 to-rose-300/30 rounded-full blur-xl pointer-events-none"></div>
            <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-gradient-to-br from-purple-300/30 to-pink-300/30 rounded-full blur-xl pointer-events-none"></div>
            
            {/* Floating decorative elements */}
            <div className="absolute top-1/4 right-10 w-6 h-6 bg-gradient-to-br from-pink-400/20 to-rose-400/20 rounded-full blur-md pointer-events-none animate-float"></div>
            <div className="absolute bottom-1/4 left-10 w-6 h-6 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-md pointer-events-none animate-float" style={{animationDelay: '1.5s'}}></div>
            
            {/* Small decorative icons */}
            <div className="absolute top-20 right-6 opacity-20 animate-pulse-slow pointer-events-none">
              <Star className="w-4 h-4 text-pink-400" />
            </div>
            <div className="absolute bottom-20 left-6 opacity-20 animate-pulse-slow pointer-events-none" style={{animationDelay: '1s'}}>
              <Heart className="w-4 h-4 text-purple-400" />
            </div>
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-pink-50 to-rose-50 relative overflow-hidden shadow-sm">
              <div className="absolute inset-0 opacity-50">
                <div className="absolute -top-10 left-20 w-40 h-40 bg-gradient-to-br from-pink-200/20 to-rose-200/20 rounded-full blur-xl"></div>
                <div className="absolute -bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-rose-200/20 to-pink-200/20 rounded-full blur-xl"></div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-pink-200/50 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-5 h-5 text-white animate-pulse" />
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent tracking-wide">{title}</h3>
              </div>
              
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-2xl hover:bg-white/80 transition-colors duration-200 group relative z-10"
                >
                  <X className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
                </button>
              )}
            </div>
            
            {/* Content */}
            <div className="p-6 relative z-10">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};