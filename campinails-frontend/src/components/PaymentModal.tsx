import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { CreditCard, Smartphone, DollarSign, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import type { Appointment } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
  onPaymentSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onPaymentSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'mercadopago' | 'stripe' | 'transfer'>('mercadopago');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const paymentMethods = [
    {
      id: 'mercadopago' as const,
      name: 'MercadoPago',
      description: 'Tarjetas, transferencia o efectivo',
      icon: Smartphone,
      color: 'from-blue-500 to-indigo-500',
      popular: true,
    },
    {
      id: 'stripe' as const,
      name: 'Tarjeta de Crédito',
      description: 'Visa, Mastercard, American Express',
      icon: CreditCard,
      color: 'from-purple-500 to-pink-500',
      popular: false,
    },
    {
      id: 'transfer' as const,
      name: 'Transferencia Bancaria',
      description: 'CBU/Alias disponible',
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
      popular: false,
    },
  ];

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Simular procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setShowSuccess(true);
      setTimeout(() => {
        onPaymentSuccess();
        onClose();
        setShowSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error processing payment:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (showSuccess) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="¡Pago Exitoso!" showCloseButton={false}>
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">¡Perfecto!</h3>
          <p className="text-gray-600 mb-6">
            Tu pago ha sido procesado exitosamente. Tu turno está confirmado.
          </p>
          <div className="bg-green-50 rounded-2xl p-4">
            <p className="text-green-800 font-medium">
              Recibirás un WhatsApp con la confirmación en breve.
            </p>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirmar tu Turno" size="lg">
      <div className="space-y-6">
        {/* Resumen del turno */}
        <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-100">
          <h3 className="font-semibold text-gray-800 mb-4">Resumen de tu turno</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Servicio:</span>
              <span className="font-medium text-gray-800">{appointment.service?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Fecha:</span>
              <span className="font-medium text-gray-800">
                {new Date(appointment.scheduled_at).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hora:</span>
              <span className="font-medium text-gray-800">
                {new Date(appointment.scheduled_at).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <div className="border-t border-pink-200 pt-3 mt-3">
              <div className="flex justify-between text-lg">
                <span className="font-semibold text-gray-800">Seña a pagar:</span>
                <span className="font-bold text-pink-600">
                  {formatCurrency(appointment.deposit_amount)}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Total del servicio: {formatCurrency(appointment.total_price)}
              </p>
            </div>
          </div>
        </div>

        {/* Métodos de pago */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-4">Elige tu método de pago</h3>
          <div className="space-y-3">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 ${
                    selectedMethod === method.id
                      ? 'border-pink-300 bg-pink-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${method.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-800">{method.name}</span>
                        {method.popular && (
                          <span className="bg-pink-100 text-pink-700 text-xs px-2 py-1 rounded-full font-medium">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{method.description}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      selectedMethod === method.id
                        ? 'border-pink-500 bg-pink-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedMethod === method.id && (
                        <div className="w-full h-full rounded-full bg-white scale-50" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Información de seguridad */}
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-blue-600" />
            <div>
              <h4 className="font-medium text-blue-800">Pago 100% Seguro</h4>
              <p className="text-sm text-blue-600">
                Tus datos están protegidos con encriptación SSL de nivel bancario
              </p>
            </div>
          </div>
        </div>

        {/* Información adicional según método */}
        {selectedMethod === 'transfer' && (
          <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800 mb-2">Datos para transferencia</h4>
                <div className="space-y-1 text-sm text-green-700">
                  <p><strong>CBU:</strong> 0000003100010000000001</p>
                  <p><strong>Alias:</strong> CAMPI.NAILS.MP</p>
                  <p><strong>Titular:</strong> Camila Nails</p>
                  <p><strong>Banco:</strong> Mercado Pago</p>
                </div>
                <p className="text-xs text-green-600 mt-2">
                  Envía el comprobante por WhatsApp para confirmar tu turno
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex space-x-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-colors duration-200 font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl hover:from-pink-600 hover:to-rose-600 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <span>Pagar {formatCurrency(appointment.deposit_amount)}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};