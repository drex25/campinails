import React, { useState, useEffect } from 'react';
import { clientService } from '../../services/api';
import type { Client } from '../../types';
import { Users, Plus, Search, Phone, Mail, User, Calendar, Star } from 'lucide-react';

export const ClientsSection: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setIsLoading(true);
    try {
      const data = await clientService.getAll();
      setClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.whatsapp.includes(searchTerm) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Clientes</h2>
              <p className="text-gray-600">Gestiona tu base de clientes</p>
            </div>
          </div>

          <button className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-2xl hover:from-pink-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-lg">
            <Plus className="w-5 h-5" />
            <span>Nuevo Cliente</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all duration-300"
          />
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <div
            key={client.id}
            className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 p-6"
          >
            {/* Client Header */}
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-pink-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">{client.name}</h3>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  client.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {client.is_active ? 'Activo' : 'Inactivo'}
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">{client.whatsapp}</span>
              </div>
              
              {client.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-600">{client.email}</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-2xl">
                <div className="text-lg font-bold text-gray-800">0</div>
                <div className="text-xs text-gray-600">Turnos</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-2xl">
                <div className="text-lg font-bold text-gray-800">$0</div>
                <div className="text-xs text-gray-600">Gastado</div>
              </div>
            </div>

            {/* Notes */}
            {client.notes && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-2xl">
                  {client.notes}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-green-50 text-green-600 rounded-2xl hover:bg-green-100 transition-colors duration-200">
                <Phone className="w-4 h-4" />
                <span className="text-sm font-medium">Llamar</span>
              </button>
              
              <button className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition-colors duration-200">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">Turno</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredClients.length === 0 && (
        <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {searchTerm ? 'No se encontraron clientes' : 'No hay clientes'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? 'Intenta con otros términos de búsqueda'
              : 'Los nuevos clientes aparecerán aquí'
            }
          </p>
          {!searchTerm && (
            <button className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-2xl hover:from-pink-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105">
              Agregar Primer Cliente
            </button>
          )}
        </div>
      )}
    </div>
  );
};