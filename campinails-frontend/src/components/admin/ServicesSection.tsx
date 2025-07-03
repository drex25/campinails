import React, { useState, useEffect } from 'react';
import { serviceService } from '../../services/api';
import type { Service } from '../../types';
import { Scissors, Plus, Edit, Trash2, Eye, DollarSign, Clock, Star } from 'lucide-react';

export const ServicesSection: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setIsLoading(true);
    try {
      const data = await serviceService.getAll();
      setServices(data);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás segura de que quieres eliminar este servicio?')) {
      try {
        await serviceService.delete(id);
        await loadServices();
      } catch (error) {
        console.error('Error deleting service:', error);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}min`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}min`;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-3xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <Scissors className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Servicios</h2>
              <p className="text-gray-600">Gestiona tu catálogo de servicios</p>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingService(null);
              setShowForm(true);
            }}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl hover:from-pink-600 hover:to-rose-600 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Servicio</span>
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
          >
            {/* Service Header */}
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Scissors className="w-6 h-6" />
                </div>
                <div className="flex items-center space-x-1">
                  {service.is_active ? (
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  ) : (
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  )}
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">{service.name}</h3>
              {service.description && (
                <p className="text-pink-100 text-sm">{service.description}</p>
              )}
            </div>

            {/* Service Details */}
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-600">Precio</span>
                  </div>
                  <span className="text-xl font-bold text-gray-800">
                    {formatCurrency(service.price)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-600">Duración</span>
                  </div>
                  <span className="font-semibold text-gray-800">
                    {formatDuration(service.duration_minutes)}
                  </span>
                </div>

                {service.requires_deposit && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Star className="w-5 h-5 text-yellow-600" />
                      <span className="text-sm text-gray-600">Seña</span>
                    </div>
                    <span className="font-semibold text-gray-800">
                      {service.deposit_percentage}%
                    </span>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(service)}
                      className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition-colors duration-200"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="text-sm font-medium">Editar</span>
                    </button>
                    
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Eliminar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="px-6 pb-6">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                service.is_active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {service.is_active ? 'Activo' : 'Inactivo'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {services.length === 0 && (
        <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Scissors className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No hay servicios</h3>
          <p className="text-gray-600 mb-6">Comienza agregando tu primer servicio</p>
          <button
            onClick={() => {
              setEditingService(null);
              setShowForm(true);
            }}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl hover:from-pink-600 hover:to-rose-600 transition-all duration-200 transform hover:scale-105"
          >
            Crear Primer Servicio
          </button>
        </div>
      )}

      {/* Service Form Modal/Drawer would go here */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
            </h3>
            <p className="text-gray-600 mb-6">Formulario de servicio aquí...</p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-colors duration-200"
              >
                Cancelar
              </button>
              <button className="flex-1 py-3 px-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl hover:from-pink-600 hover:to-rose-600 transition-all duration-200">
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};