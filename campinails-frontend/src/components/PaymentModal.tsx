import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { CreditCard, Smartphone, DollarSign, Shield, CheckCircle, AlertCircle, Copy, ExternalLink } from 'lucide-react';
import type { Appointment } from '../types';
import { paymentService } from '../services/api';

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
  const [paymentUrl, setPaymentUrl] = useState<string>('');
  const [showTransferInfo, setShowTransferInfo] = useState(false);
  const [error, setError] = useState<string>('');

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
    setError('');
    
    try {
      if (selectedMethod === 'transfer') {
        // Para transferencia, mostrar información y marcar como pendiente
        setShowTransferInfo(true);
        return;
      }

      // Para MercadoPago y Stripe, procesar pago automático
      const paymentData = {
        appointment_id: appointment.id,
        amount: appointment.deposit_amount,
        payment_method: selectedMethod,
        payment_provider: selectedMethod,
        metadata: {
          service_name: appointment.service?.name,
          client_name: appointment.client?.name
        }
      };

      console.log('Datos del pago a enviar:', paymentData);
      const result = await paymentService.create(paymentData);
      
      if (selectedMethod === 'mercadopago') {
        // Redirigir a MercadoPago
        setPaymentUrl(result.init_point || result.sandbox_init_point);
        window.open(result.init_point || result.sandbox_init_point, '_blank');
      } else if (selectedMethod === 'stripe') {
        // Redirigir a Stripe
        setPaymentUrl(result.checkout_url);
        window.open(result.checkout_url, '_blank');
      }
      
      // Mostrar mensaje de éxito temporal
      setShowSuccess(true);
      setTimeout(() => {
        onPaymentSuccess();
        onClose();
        setShowSuccess(false);
      }, 3000);
      
    } catch (err: any) {
      console.error('Error processing payment:', err);
      setError(err.response?.data?.message || 'Error al procesar el pago');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTransferPayment = async () => {
    setIsProcessing(true);
    setError('');
    
    try {
      // Crear pago pendiente para transferencia
      const paymentData = {
        appointment_id: appointment.id,
        amount: appointment.deposit_amount,
        payment_method: 'transfer',
        payment_provider: 'manual',
        metadata: {
          service_name: appointment.service?.name,
          client_name: appointment.client?.name,
          transfer_info: {
            cbu: '0000003100010000000001',
            alias: 'CAMPI.NAILS.MP',
            holder: 'Camila Nails',
            bank: 'Mercado Pago'
          }
        }
      };

      await paymentService.create(paymentData);
      
      setShowSuccess(true);
      setTimeout(() => {
        onPaymentSuccess();
        onClose();
        setShowSuccess(false);
      }, 3000);
      
    } catch (err: any) {
      console.error('Error creating transfer payment:', err);
      setError(err.response?.data?.message || 'Error al crear el pago por transferencia');
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

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Aquí podrías mostrar un toast de éxito
      console.log(`${label} copiado al portapapeles`);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  if (showSuccess) {
    const isTransfer = selectedMethod === 'transfer';
    
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={isTransfer ? "¡Pago Pendiente!" : "¡Pago Exitoso!"} showCloseButton={false}>
        <div className="text-center py-8">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isTransfer ? 'bg-yellow-100' : 'bg-green-100'}`}>
            <CheckCircle className={`w-10 h-10 ${isTransfer ? 'text-yellow-600' : 'text-green-600'}`} />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            {isTransfer ? '¡Pago Pendiente!' : '¡Perfecto!'}
          </h3>
          <p className="text-gray-600 mb-6">
            {isTransfer 
              ? 'Tu pago por transferencia ha sido registrado. Te contactaremos por WhatsApp cuando confirmemos la recepción.'
              : 'Tu pago ha sido procesado exitosamente. Tu turno está confirmado.'
            }
          </p>
          <div className={`rounded-2xl p-4 ${isTransfer ? 'bg-yellow-50' : 'bg-green-50'}`}>
            <p className={`font-medium ${isTransfer ? 'text-yellow-800' : 'text-green-800'}`}>
              {isTransfer 
                ? 'Envía el comprobante por WhatsApp para agilizar la confirmación.'
                : 'Recibirás un WhatsApp con la confirmación en breve.'
              }
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
              <div className="flex-1">
                <h4 className="font-medium text-green-800 mb-3">Datos para transferencia</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-green-200">
                    <div>
                      <p className="text-xs text-green-600 font-medium">CBU</p>
                      <p className="text-sm text-green-800 font-mono">0000003100010000000001</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard('0000003100010000000001', 'CBU')}
                      className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-green-200">
                    <div>
                      <p className="text-xs text-green-600 font-medium">Alias</p>
                      <p className="text-sm text-green-800 font-mono">CAMPI.NAILS.MP</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard('CAMPI.NAILS.MP', 'Alias')}
                      className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm text-green-700">
                    <div>
                      <p className="font-medium">Titular:</p>
                      <p>Camila Nails</p>
                    </div>
                    <div>
                      <p className="font-medium">Banco:</p>
                      <p>Mercado Pago</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-green-600 mt-3">
                  Copia los datos y envía el comprobante por WhatsApp para confirmar tu turno
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <p className="text-red-600 text-sm">{error}</p>
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
          
          {selectedMethod === 'transfer' && showTransferInfo ? (
            <button
              onClick={handleTransferPayment}
              disabled={isProcessing}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Registrando...</span>
                </>
              ) : (
                <>
                  <span>Confirmar Transferencia</span>
                </>
              )}
            </button>
          ) : (
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
              ) : selectedMethod === 'transfer' ? (
                <>
                  <span>Ver Datos de Transferencia</span>
                </>
              ) : (
                <>
                  <span>Pagar {formatCurrency(appointment.deposit_amount)}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};