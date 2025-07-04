import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

export const PaymentFailurePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const status = searchParams.get('status');
    const externalReference = searchParams.get('external_reference');

    if (status === 'rejected') {
      setError('El pago fue rechazado. Por favor, intenta con otro método de pago.');
    } else if (status === 'cancelled') {
      setError('El pago fue cancelado. Tu turno permanece pendiente de confirmación.');
    } else {
      setError('Hubo un problema con el pago. Por favor, contacta con soporte.');
    }
    
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Procesando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Pago Fallido
        </h1>
        
        <p className="text-gray-600 mb-6">
          {error}
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <span className="font-medium text-yellow-800">Importante</span>
          </div>
          <p className="text-sm text-yellow-700">
            Tu turno permanece reservado por 30 minutos. Completa el pago para confirmarlo.
          </p>
        </div>

        <div className="space-y-3 text-sm text-gray-600">
          <p>Si tienes problemas con el pago:</p>
          <ul className="text-left space-y-1">
            <li>• Verifica que tu tarjeta esté habilitada</li>
            <li>• Intenta con otro método de pago</li>
            <li>• Contacta con soporte si el problema persiste</li>
          </ul>
        </div>

        <div className="mt-8 space-y-3">
          <button
            onClick={() => window.history.back()}
            className="w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl hover:from-pink-600 hover:to-rose-600 transition-all duration-200 font-medium flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Intentar Nuevamente</span>
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-colors duration-200 font-medium"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  );
}; 