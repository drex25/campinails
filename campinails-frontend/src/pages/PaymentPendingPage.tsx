import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';

export const PaymentPendingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<any>(null);

  useEffect(() => {
    const paymentId = searchParams.get('payment_id');
    const status = searchParams.get('status');
    const externalReference = searchParams.get('external_reference');

    if (status === 'pending' && externalReference) {
      setAppointment({
        id: externalReference,
        status: 'pending'
      });
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
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-yellow-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Pago Pendiente
        </h1>
        
        <p className="text-gray-600 mb-6">
          Tu pago está siendo procesado. Esto puede tomar unos minutos.
        </p>

        {appointment && (
          <div className="bg-gray-50 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <span className="font-medium text-gray-800">Turno en Espera</span>
            </div>
            <p className="text-sm text-gray-600">
              ID: #{appointment.id}
            </p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-800">¿Qué pasa ahora?</span>
          </div>
          <div className="text-sm text-blue-700 space-y-2">
            <p>• Recibirás una notificación cuando el pago se confirme</p>
            <p>• Tu turno permanece reservado</p>
            <p>• Si el pago no se confirma en 24h, contacta con soporte</p>
          </div>
        </div>

        <div className="space-y-3 text-sm text-gray-600">
          <p>Métodos de pago que pueden estar pendientes:</p>
          <ul className="text-left space-y-1">
            <li>• Transferencias bancarias</li>
            <li>• Pagos con efectivo en puntos de pago</li>
            <li>• Algunas tarjetas de crédito</li>
          </ul>
        </div>

        <div className="mt-8 space-y-3">
          <button
            onClick={() => window.location.href = '/'}
            className="w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl hover:from-pink-600 hover:to-rose-600 transition-all duration-200 font-medium"
          >
            Volver al Inicio
          </button>
          
          <button
            onClick={() => window.close()}
            className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-colors duration-200 font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}; 