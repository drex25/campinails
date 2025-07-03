import React, { useState } from 'react';
import { CreditCard, DollarSign, TrendingUp, Plus, Filter, Search, Phone, Mail, MessageSquare } from 'lucide-react';
import { PaymentForm } from '../forms/PaymentForm';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../ui/Toast';

export const PaymentsSection: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const { toasts, removeToast, success } = useToast();

  const handleFormSuccess = () => {
    success('Pago registrado', 'El pago se registró correctamente');
    setShowForm(false);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Pagos</h2>
                <p className="text-gray-600">Gestión de pagos y facturación</p>
              </div>
            </div>

            <button 
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-2xl hover:from-emerald-600 hover:to-green-600 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Registrar Pago</span>
            </button>
          </div>
        </div>

        {/* Payment Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-800">$2.840.000</div>
                <div className="text-sm text-gray-600">Ingresos del mes</div>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">+12.5%</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-800">156</div>
                <div className="text-sm text-gray-600">Pagos procesados</div>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-blue-600">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">+8.3%</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-800">$340.000</div>
                <div className="text-sm text-gray-600">Pendientes</div>
              </div>
            </div>
            <div className="text-sm text-gray-600">12 pagos pendientes</div>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-800">$18.205</div>
                <div className="text-sm text-gray-600">Promedio por pago</div>
              </div>
            </div>
            <div className="text-sm text-gray-600">Último mes</div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Métodos de Pago</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Tarjeta de Crédito</h4>
              <p className="text-sm text-gray-600 mb-4">Pagos seguros con Stripe</p>
              <div className="text-2xl font-bold text-blue-600">65%</div>
              <div className="text-sm text-gray-500">de los pagos</div>
            </div>

            <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Efectivo</h4>
              <p className="text-sm text-gray-600 mb-4">Pagos en el local</p>
              <div className="text-2xl font-bold text-green-600">25%</div>
              <div className="text-sm text-gray-500">de los pagos</div>
            </div>

            <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">MercadoPago</h4>
              <p className="text-sm text-gray-600 mb-4">Transferencias y QR</p>
              <div className="text-2xl font-bold text-purple-600">10%</div>
              <div className="text-sm text-gray-500">de los pagos</div>
            </div>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Pagos Recientes</h3>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar pagos..."
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-300 transition-all duration-300 text-sm"
                />
              </div>
              <button className="p-2 rounded-2xl border border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                <Filter className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Placeholder payments */}
            {[
              { id: 1, client: 'María González', amount: 15000, method: 'Tarjeta', status: 'completed', date: '2024-01-15' },
              { id: 2, client: 'Ana Rodríguez', amount: 20000, method: 'Efectivo', status: 'completed', date: '2024-01-15' },
              { id: 3, client: 'Laura Fernández', amount: 12000, method: 'MercadoPago', status: 'pending', date: '2024-01-14' },
              { id: 4, client: 'Sofía Martín', amount: 18000, method: 'Tarjeta', status: 'completed', date: '2024-01-14' },
            ].map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors duration-200">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    payment.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'
                  }`}>
                    <CreditCard className={`w-5 h-5 ${
                      payment.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                    }`} />
                  </div>
                  
                  <div>
                    <div className="font-medium text-gray-800">{payment.client}</div>
                    <div className="text-sm text-gray-600">{payment.method} • {payment.date}</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-semibold text-gray-800">
                    ${payment.amount.toLocaleString()}
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    payment.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {payment.status === 'completed' ? 'Completado' : 'Pendiente'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center space-x-3 p-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 transition-all duration-200 transform hover:scale-105">
              <Phone className="w-5 h-5" />
              <span className="font-medium">Llamar por Pago</span>
            </button>
            
            <button className="flex items-center space-x-3 p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 transform hover:scale-105">
              <Mail className="w-5 h-5" />
              <span className="font-medium">Enviar Recordatorio</span>
            </button>
            
            <button className="flex items-center space-x-3 p-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105">
              <MessageSquare className="w-5 h-5" />
              <span className="font-medium">WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      {/* Payment Form Modal */}
      <PaymentForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={handleFormSuccess}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
};