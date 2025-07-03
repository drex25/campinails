import React, { useState } from 'react';
import { Tag, Plus, Percent, Gift, Calendar, Users, Edit, Trash2 } from 'lucide-react';
import { PromotionForm } from '../forms/PromotionForm';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../ui/Toast';

export const PromotionsSection: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<any>(null);
  const { toasts, removeToast, success } = useToast();

  const handleFormSuccess = () => {
    success('Promoción guardada', 'La promoción se guardó correctamente');
    setShowForm(false);
    setEditingPromotion(null);
  };

  const handleEdit = (promotion: any) => {
    setEditingPromotion(promotion);
    setShowForm(true);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                <Tag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Promociones</h2>
                <p className="text-gray-600">Gestiona ofertas y descuentos</p>
              </div>
            </div>

            <button 
              onClick={() => {
                setEditingPromotion(null);
                setShowForm(true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Nueva Promoción</span>
            </button>
          </div>
        </div>

        {/* Active Promotions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Promotion Card 1 */}
          <div className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Percent className="w-6 h-6" />
                </div>
                <div className="bg-green-400 text-green-900 px-2 py-1 rounded-full text-xs font-medium">
                  Activa
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Descuento de Verano</h3>
              <p className="text-pink-100 text-sm">20% off en todos los servicios</p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Código</span>
                  <span className="font-mono font-semibold text-gray-800">VERANO20</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Descuento</span>
                  <span className="font-semibold text-gray-800">20%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Usos</span>
                  <span className="font-semibold text-gray-800">15 / 100</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Válido hasta</span>
                  <span className="font-semibold text-gray-800">31/01/2024</span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleEdit({ id: 1, name: 'Descuento de Verano', code: 'VERANO20' })}
                    className="flex-1 py-2 px-4 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition-colors duration-200 text-sm font-medium flex items-center justify-center space-x-1"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                  <button className="flex-1 py-2 px-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-colors duration-200 text-sm font-medium">
                    Pausar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Promotion Card 2 */}
          <div className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Gift className="w-6 h-6" />
                </div>
                <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium">
                  Programada
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Cliente Nuevo</h3>
              <p className="text-purple-100 text-sm">50% off en primer servicio</p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Código</span>
                  <span className="font-mono font-semibold text-gray-800">NUEVO50</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Descuento</span>
                  <span className="font-semibold text-gray-800">50%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Usos</span>
                  <span className="font-semibold text-gray-800">0 / ∞</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Inicia</span>
                  <span className="font-semibold text-gray-800">01/02/2024</span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleEdit({ id: 2, name: 'Cliente Nuevo', code: 'NUEVO50' })}
                    className="flex-1 py-2 px-4 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition-colors duration-200 text-sm font-medium flex items-center justify-center space-x-1"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                  <button className="flex-1 py-2 px-4 bg-green-50 text-green-600 rounded-2xl hover:bg-green-100 transition-colors duration-200 text-sm font-medium">
                    Activar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Promotion Card 3 */}
          <div className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div className="bg-red-400 text-red-900 px-2 py-1 rounded-full text-xs font-medium">
                  Expirada
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Referido Amiga</h3>
              <p className="text-emerald-100 text-sm">$5000 off por referido</p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Código</span>
                  <span className="font-mono font-semibold text-gray-800">AMIGA5K</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Descuento</span>
                  <span className="font-semibold text-gray-800">$5.000</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Usos</span>
                  <span className="font-semibold text-gray-800">8 / 20</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Expiró</span>
                  <span className="font-semibold text-gray-800">15/01/2024</span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <button className="flex-1 py-2 px-4 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition-colors duration-200 text-sm font-medium">
                    Renovar
                  </button>
                  <button className="flex-1 py-2 px-4 bg-gray-50 text-gray-600 rounded-2xl hover:bg-gray-100 transition-colors duration-200 text-sm font-medium">
                    Archivar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Promotion Templates */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Plantillas de Promociones</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Percent, title: 'Descuento Porcentual', desc: 'X% off en servicios' },
              { icon: Gift, title: 'Descuento Fijo', desc: '$X off en total' },
              { icon: Users, title: 'Referido', desc: 'Descuento por traer amigos' },
              { icon: Calendar, title: 'Día Especial', desc: 'Ofertas por fechas' },
            ].map((template, index) => {
              const Icon = template.icon;
              return (
                <div key={index} className="p-4 border border-gray-200 rounded-2xl hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 cursor-pointer group">
                  <div className="w-12 h-12 bg-gray-100 group-hover:bg-orange-100 rounded-2xl flex items-center justify-center mb-3 transition-colors duration-200">
                    <Icon className="w-6 h-6 text-gray-600 group-hover:text-orange-600" />
                  </div>
                  <h4 className="font-medium text-gray-800 mb-1">{template.title}</h4>
                  <p className="text-sm text-gray-600">{template.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Promotion Stats */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Estadísticas de Promociones</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">23</div>
              <div className="text-sm text-gray-600">Promociones usadas</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">$142.000</div>
              <div className="text-sm text-gray-600">Descuentos otorgados</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">18</div>
              <div className="text-sm text-gray-600">Nuevos clientes</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">85%</div>
              <div className="text-sm text-gray-600">Tasa de conversión</div>
            </div>
          </div>
        </div>
      </div>

      {/* Promotion Form Modal */}
      <PromotionForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingPromotion(null);
        }}
        promotion={editingPromotion}
        onSuccess={handleFormSuccess}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
};