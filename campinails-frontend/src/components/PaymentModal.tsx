import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { CreditCard, Smartphone, DollarSign, Shield, CheckCircle, AlertCircle, Copy, ExternalLink, Camera, X, Clock, CreditCard as CardIcon, Wallet, Banknote, Building, ArrowRight, Calendar, Sparkles, Star, Heart } from 'lucide-react';
import type { Appointment } from '../types';
import { paymentService } from '../services/api';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
  onPaymentSuccess: (paymentMethod?: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onPaymentSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'mercadopago' | 'stripe' | 'transfer' | 'cash'>('mercadopago');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string>('');
  const [showTransferInfo, setShowTransferInfo] = useState(false);
  const [showCashInfo, setShowCashInfo] = useState(false);
  const [transferReceipt, setTransferReceipt] = useState<File | null>(null);
  const [transferReceiptPreview, setTransferReceiptPreview] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  // Métodos de pago agrupados por categoría
  const paymentMethodGroups = {
    online: [
      { 
        id: 'mercadopago' as const, 
        name: 'MercadoPago', 
        description: 'Tarjetas, QR, billeteras', 
        icon: Smartphone, 
        color: 'from-blue-500 to-indigo-500', 
        popular: true, 
        badge: 'Recomendado'
      }, 
      { 
        id: 'stripe' as const, 
        name: 'Tarjeta de Crédito', 
        description: 'Visa, Mastercard, Amex', 
        icon: CreditCard, 
        color: 'from-purple-500 to-pink-500', 
        popular: false,
        badge: null
      },
    ],
    inPerson: [
      { 
        id: 'cash' as const, 
        name: 'Efectivo', 
        description: 'Pago en el local', 
        icon: Banknote, 
        color: 'from-yellow-500 to-orange-500', 
        popular: false,
        badge: 'En local'
      }, 
      { 
        id: 'transfer' as const, 
        name: 'Transferencia', 
        description: 'CBU/Alias disponible', 
        icon: Building, 
        color: 'from-green-500 to-emerald-500', 
        popular: false,
        badge: 'Más usado'
      },
    ]
  };
  
  // Combinar todos los métodos para facilitar la búsqueda
  const allPaymentMethods = [...paymentMethodGroups.online, ...paymentMethodGroups.inPerson];

  const handlePayment = async () => {
    setIsProcessing(true);
    setError('');
    
    try {
      if (selectedMethod === 'cash') {
        // Para efectivo, mostrar información y marcar como pendiente
        setShowCashInfo(true);
        return;
      } else if (selectedMethod === 'transfer') {
        // Para transferencia, mostrar información y marcar como pendiente
        setShowTransferInfo(true);
        return;
      }

      // Para MercadoPago y Stripe, procesar pago automático
      const paymentData = {
        payment_method: selectedMethod
      };

      console.log('Datos del pago a enviar:', paymentData);
      const result = await paymentService.processAppointmentPayment(appointment.id, paymentData);
      
      if (selectedMethod === 'mercadopago') {
        // Redirigir a MercadoPago
        const paymentUrl = result.payment_url || result.init_point || result.sandbox_init_point;
        setPaymentUrl(paymentUrl);
        window.open(paymentUrl, '_blank');
        
        // Mostrar mensaje informativo para MercadoPago (NO éxito, solo información)
        setShowSuccess(true);
        // NO cerrar el modal automáticamente - el usuario debe cerrarlo manualmente
        // o esperar la confirmación del pago
      } else if (selectedMethod === 'stripe') {
        // Redirigir a Stripe
        const paymentUrl = result.payment_url || result.checkout_url;
        setPaymentUrl(paymentUrl);
        window.open(paymentUrl, '_blank');
        
        // Mostrar mensaje informativo para Stripe (NO éxito, solo información)
        setShowSuccess(true);
        // NO cerrar el modal automáticamente - el usuario debe cerrarlo manualmente
        // o esperar la confirmación del pago
      }
      
    } catch (err: any) {
      console.error('Error processing payment:', err);
      setError(err.response?.data?.message || 'Error al procesar el pago');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCashPayment = async () => {
    setIsProcessing(true);
    setError('');
    
    try {
      // Crear pago pendiente para efectivo
      const paymentData = {
        payment_method: 'cash'
      };

      await paymentService.processAppointmentPayment(appointment.id, paymentData);
      
      setShowSuccess(true);
      setTimeout(() => {
        onPaymentSuccess('cash');
        onClose();
        setShowSuccess(false);
      }, 3000);
      
    } catch (err: any) {
      console.error('Error creating cash payment:', err);
      setError(err.response?.data?.message || 'Error al crear el pago en efectivo');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTransferPayment = async () => {
    setIsProcessing(true);
    setError('');
    
    try {
      // Validar que se haya subido un comprobante
      if (!transferReceipt) {
        setError('Debes subir un comprobante de transferencia');
        setIsProcessing(false);
        return;
      }
      
      // Crear pago pendiente para transferencia
      const paymentData = {
        payment_method: 'transfer'
      };

      await paymentService.processAppointmentPayment(appointment.id, paymentData);
      
      setShowSuccess(true);
      setTimeout(() => {
        onPaymentSuccess('transfer');
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setTransferReceipt(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setTransferReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
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
    const isCash = selectedMethod === 'cash';
    const isMercadoPago = selectedMethod === 'mercadopago';
    const isStripe = selectedMethod === 'stripe';
    
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={isTransfer ? "¡Pago Pendiente!" : "¡Pago Exitoso!"} showCloseButton={false} size="md">
        <div className="text-center py-8 relative">
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-yellow-300/20 to-orange-300/20 rounded-full blur-xl"></div>
          <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-gradient-to-br from-yellow-300/20 to-orange-300/20 rounded-full blur-xl"></div>
          
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg ${
            isTransfer || isCash || isMercadoPago || isStripe ? 'bg-gradient-to-r from-yellow-400 to-orange-400 shadow-yellow-200' : 'bg-gradient-to-r from-green-400 to-emerald-400 shadow-green-200'
          }`}>
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h3 className={`text-2xl font-bold mb-4 ${
            isTransfer || isCash || isMercadoPago || isStripe ? 'bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent' : 'bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent'
          }`}>
            {isTransfer ? '¡Pago Pendiente!' : isCash ? '¡Turno Reservado!' : isMercadoPago || isStripe ? '¡Pago en Proceso!' : '¡Perfecto!'}
          </h3>
          <p className="text-gray-600 mb-6">
            {isTransfer 
              ? 'Tu pago por transferencia ha sido registrado. Te contactaremos por WhatsApp cuando confirmemos la recepción.'
              : isCash
              ? 'Tu turno ha sido reservado. Deberás abonar la seña en efectivo al llegar al local.'
              : isMercadoPago
              ? 'Se ha abierto una nueva ventana con MercadoPago. Completa el pago allí y tu turno quedará confirmado automáticamente. Te enviaremos un WhatsApp cuando el pago se confirme.'
              : isStripe
              ? 'Se ha abierto una nueva ventana con Stripe. Completa el pago allí y tu turno quedará confirmado automáticamente. Te enviaremos un WhatsApp cuando el pago se confirme.'
              : 'Tu pago ha sido procesado exitosamente. Tu turno está confirmado.'
            }
          </p>
          <div className={`rounded-2xl p-4 border ${isTransfer || isCash || isMercadoPago || isStripe ? 'bg-yellow-50 border-yellow-100' : 'bg-green-50 border-green-100'}`}>
            <p className={`font-medium ${isTransfer || isCash || isMercadoPago || isStripe ? 'text-yellow-800' : 'text-green-800'}`}>
              {isTransfer 
                ? `Monto registrado: ${formatCurrency(appointment.deposit_amount || 0)}`
                : isCash
                ? 'Recuerda llegar 10 minutos antes para realizar el pago.'
                : isMercadoPago || isStripe
                ? 'Si la ventana no se abrió, haz clic en el enlace de pago que recibirás por WhatsApp.'
                : 'Recibirás un WhatsApp con la confirmación en breve.'}
              <br />
              <span className="inline-block mt-2">Total del servicio: <span className="font-bold">{formatCurrency(appointment.total_price || 0)}</span></span>
            </p>
          </div>
          

          
          {/* Botón para cerrar el modal manualmente */}
          {(isMercadoPago || isStripe) && (
            <div className="mt-6">
              <button
                onClick={() => {
                  onPaymentSuccess(selectedMethod);
                  onClose();
                  setShowSuccess(false);
                }}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-2xl font-semibold hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-lg shadow-pink-200/50 transform hover:scale-105"
              >
                Entendido, cerrar
              </button>
            </div>
          )}
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirmar tu Turno" size="xl">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Columna 1: Resumen del turno */}
          <div className="md:col-span-1">
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-5 border border-pink-100 h-full shadow-md">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-pink-500" />
                Resumen del turno
              </h3>
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
                      day: 'numeric',
                      month: 'long'
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
                    <span className="font-semibold text-gray-800">Seña:</span>
                    <span className="font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                      {formatCurrency(appointment.deposit_amount)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Total: {formatCurrency(appointment.total_price)}
                  </p>
                </div>
              </div>
              
              {/* Información de seguridad */}
              <div className="mt-4 bg-blue-50 rounded-xl p-3 border border-blue-100 shadow-inner">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <p className="text-xs text-blue-700 font-medium">
                    Pago 100% Seguro con encriptación SSL
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Columna 2-3: Métodos de pago */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-md">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                <Wallet className="w-5 h-5 mr-2 text-pink-500" />
                Elige tu método de pago
              </h3>
              
              {/* Métodos de pago en línea */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Pago en línea</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {paymentMethodGroups.online.map((method) => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={`w-full p-3 rounded-xl border-2 transition-all duration-200 transform relative ${
                          selectedMethod === method.id
                            ? 'border-pink-300 bg-pink-50 shadow-md scale-105'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:scale-[1.02]'
                        }`}
                        style={{ minHeight: '72px' }}
                      >
                        {/* Badge bien posicionado */}
                        {method.badge && (
                          <span className="absolute -top-3 -right-3 bg-pink-500 text-white text-[11px] px-2 py-0.5 rounded-full font-semibold shadow z-10 whitespace-nowrap select-none">
                            {method.badge}
                          </span>
                        )}
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${method.color} flex items-center justify-center shadow-md`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 text-left">
                            <span className="font-medium text-gray-800 block leading-tight">{method.name}</span>
                            <p className="text-xs text-gray-500 leading-tight">{method.description}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedMethod === method.id
                              ? 'border-pink-500 bg-pink-500'
                              : 'border-gray-300'
                          }`}>
                            {selectedMethod === method.id && (
                              <div className="w-3 h-3 rounded-full bg-white" />
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Métodos de pago presencial */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Pago presencial</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {paymentMethodGroups.inPerson.map((method) => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={`w-full p-3 rounded-xl border-2 transition-all duration-200 transform relative ${
                          selectedMethod === method.id
                            ? 'border-pink-300 bg-pink-50 shadow-md scale-105'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:scale-[1.02]'
                        }`}
                        style={{ minHeight: '72px' }}
                      >
                        {/* Badge bien posicionado */}
                        {method.badge && (
                          <span className="absolute -top-3 -right-3 bg-pink-500 text-white text-[11px] px-2 py-0.5 rounded-full font-semibold shadow z-10 whitespace-nowrap select-none">
                            {method.badge}
                          </span>
                        )}
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${method.color} flex items-center justify-center shadow-md`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 text-left">
                            <span className="font-medium text-gray-800 block leading-tight">{method.name}</span>
                            <p className="text-xs text-gray-500 leading-tight">{method.description}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedMethod === method.id
                              ? 'border-pink-500 bg-pink-500'
                              : 'border-gray-300'
                          }`}>
                            {selectedMethod === method.id && (
                              <div className="w-3 h-3 rounded-full bg-white" />
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Información adicional según método */}
              {selectedMethod === 'transfer' && showTransferInfo && (
                <div className="mt-4 bg-green-50 rounded-xl p-4 border border-green-100 shadow-inner">
                  <h4 className="font-medium text-green-800 mb-3 flex items-center">
                    <Building className="w-4 h-4 mr-1" />
                    <span className="bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">Datos para transferencia</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 md:col-span-1 flex flex-col p-3 bg-white rounded-lg border border-green-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-green-600 font-medium">CBU</p>
                        <button
                          onClick={() => copyToClipboard('0000003100010000000001', 'CBU')}
                          className="p-1 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-sm text-green-800 font-mono truncate">0000003100010000000001</p>
                    </div>
                    
                    <div className="col-span-2 md:col-span-1 flex flex-col p-3 bg-white rounded-lg border border-green-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-green-600 font-medium">Alias</p>
                        <button
                          onClick={() => copyToClipboard('CAMPI.NAILS.MP', 'Alias')}
                          className="p-1 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-sm text-green-800 font-mono">CAMPI.NAILS.MP</p>
                    </div>
                    
                    <div className="flex flex-col p-3 bg-white rounded-lg border border-green-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                      <p className="text-xs text-green-600 font-medium">Titular</p>
                      <p className="text-sm text-green-800">Camila Nails</p>
                    </div>
                    
                    <div className="flex flex-col p-3 bg-white rounded-lg border border-green-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                      <p className="text-xs text-green-600 font-medium">Banco</p>
                      <p className="text-sm text-green-800">Mercado Pago</p>
                    </div>
                  </div>
                  
                  {/* Subir comprobante */}
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-green-800 mb-2">
                      <span className="bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">Subir comprobante de transferencia</span>
                    </label>
                    
                    {transferReceiptPreview ? (
                      <div className="relative mb-2">
                        <img 
                          src={transferReceiptPreview} 
                          alt="Comprobante" 
                          className="w-full h-32 object-contain border border-green-200 rounded-lg"
                        />
                        <button
                          onClick={() => {
                            setTransferReceipt(null);
                            setTransferReceiptPreview(null);
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div 
                        className="border-2 border-dashed border-green-300 rounded-lg p-4 text-center cursor-pointer hover:bg-green-50 transition-all duration-300 transform hover:scale-[1.02]"
                        onClick={() => document.getElementById('receipt-upload')?.click()}
                      >
                        <Camera className="w-6 h-6 text-green-500 mx-auto mb-2" />
                        <p className="text-sm text-green-700 font-medium">Haz clic para subir el comprobante</p>
                        <p className="text-xs text-green-500 mt-1">JPG, PNG o PDF</p>
                      </div>
                    )}
                    
                    <input
                      id="receipt-upload"
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>
              )}
              
              {/* Información para pago en efectivo */}
              {selectedMethod === 'cash' && showCashInfo && (
                <div className="mt-4 bg-yellow-50 rounded-xl p-4 border border-yellow-100 shadow-inner">
                  <h4 className="font-medium text-yellow-800 mb-3 flex items-center">
                    <Banknote className="w-4 h-4 mr-1" />
                    <span className="bg-gradient-to-r from-yellow-700 to-amber-700 bg-clip-text text-transparent">Información importante</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col p-3 bg-white rounded-lg border border-yellow-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div className="flex items-center space-x-1 mb-1">
                        <DollarSign className="w-3 h-3 text-yellow-600" />
                        <p className="text-xs font-medium text-yellow-800">Monto</p>
                      </div>
                      <p className="text-sm text-yellow-700">
                        {formatCurrency(appointment.deposit_amount)}
                      </p>
                    </div>
                    
                    <div className="flex flex-col p-3 bg-white rounded-lg border border-yellow-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div className="flex items-center space-x-1 mb-1">
                        <Clock className="w-3 h-3 text-yellow-600" />
                        <p className="text-xs font-medium text-yellow-800">Llega antes</p>
                      </div>
                      <p className="text-sm text-yellow-700">
                        10 minutos
                      </p>
                    </div>
                    
                    <div className="col-span-2 flex flex-col p-3 bg-white rounded-lg border border-yellow-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div className="flex items-center space-x-1 mb-1">
                        <AlertCircle className="w-3 h-3 text-yellow-600" />
                        <p className="text-xs font-medium text-yellow-800">Importante</p>
                      </div>
                      <p className="text-sm text-yellow-700">
                        Sin el pago de la seña, no se garantiza la reserva del turno
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Mensaje de error */}
              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 animate-pulse">
                  <p className="text-red-600 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{error}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-white border border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all duration-200 font-medium shadow-md"
          >
            Cancelar
          </button>
          
          {selectedMethod === 'transfer' && showTransferInfo ? (
            <button
              onClick={() => {
                if (!transferReceipt) {
                  setError('Debes subir un comprobante de transferencia');
                  return;
                }
                handleTransferPayment();
              }}
              disabled={isProcessing}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg shadow-green-200/50 transform hover:scale-105"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Registrando...</span>
                </>
              ) : (
                <>
                  <span>Confirmar Transferencia</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          ) : selectedMethod === 'cash' && showCashInfo ? (
            <button
              onClick={handleCashPayment}
              disabled={isProcessing}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg shadow-yellow-200/50 transform hover:scale-105"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Registrando...</span>
                </>
              ) : (
                <>
                  <span>Confirmar Pago en Efectivo</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl hover:from-pink-600 hover:to-rose-600 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg shadow-pink-200/50 transform hover:scale-105"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : selectedMethod === 'transfer' ? (
                <>
                  <span>Pagar con Transferencia</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : selectedMethod === 'cash' ? (
                <>
                  <span>Pagar en Efectivo</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Pagar {formatCurrency(appointment.deposit_amount)}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};