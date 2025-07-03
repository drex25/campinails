import React, { useState, useEffect } from 'react';
import { appointmentService } from '../../services/api';
import type { Appointment } from '../../types';
import { Clock, Plus, Filter, Search, Calendar, User, Phone, Mail, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const AppointmentsSection: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAppointments();
  }, [filter]);

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (filter !== 'all') {
        params.status = filter;
      }
      const data = await appointmentService.getAll(params);
      setAppointments(data);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_deposit': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'no_show': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'rescheduled': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending_deposit': return 'Pendiente Seña';
      case 'confirmed': return 'Confirmado';
      case 'completed': return 'Completado';
      case 'cancelled': return 'Cancelado';
      case 'no_show': return 'No se presentó';
      case 'rescheduled': return 'Reprogramado';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'no_show': return <XCircle className="w-4 h-4" />;
      case 'pending_deposit': return <AlertCircle className="w-4 h-4" />;
      case 'rescheduled': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const filteredAppointments = appointments.filter(appointment =>
    appointment.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.service?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-2xl"></div>
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
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Gestión de Turnos</h2>
              <p className="text-gray-600">Administra todas las citas y reservas</p>
            </div>
          </div>

          <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-lg">
            <Plus className="w-5 h-5" />
            <span>Nuevo Turno</span>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por cliente o servicio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-green-300 transition-all duration-300 w-64"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-green-300 transition-all duration-300"
            >
              <option value="all">Todos los estados</option>
              <option value="pending_deposit">Pendiente seña</option>
              <option value="confirmed">Confirmados</option>
              <option value="completed">Completados</option>
              <option value="cancelled">Cancelados</option>
              <option value="no_show">No se presentó</option>
            </select>

            <button className="p-2 rounded-2xl border border-gray-200 hover:bg-gray-50 transition-colors duration-200">
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.map((appointment) => (
          <div
            key={appointment.id}
            className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Status Badge */}
                <div className={`flex items-center space-x-2 px-3 py-2 rounded-2xl border ${getStatusColor(appointment.status)}`}>
                  {getStatusIcon(appointment.status)}
                  <span className="text-sm font-medium">{getStatusText(appointment.status)}</span>
                </div>

                {/* Appointment Info */}
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {appointment.client?.name}
                    </h3>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">{appointment.service?.name}</span>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {format(new Date(appointment.scheduled_at), 'EEEE, d MMMM yyyy', { locale: es })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>
                        {format(new Date(appointment.scheduled_at), 'HH:mm')}
                      </span>
                    </div>
                    {appointment.employee && (
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>{appointment.employee.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions and Price */}
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-800">
                    {formatCurrency(appointment.total_price)}
                  </div>
                  {appointment.deposit_amount > 0 && (
                    <div className="text-sm text-gray-600">
                      Seña: {formatCurrency(appointment.deposit_amount)}
                      {appointment.deposit_paid && (
                        <span className="text-green-600 ml-1">✓</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button className="p-2 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-200">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-2xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors duration-200">
                    <Mail className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Special Requests */}
            {appointment.special_requests && (
              <div className="mt-4 p-3 bg-gray-50 rounded-2xl">
                <p className="text-sm text-gray-600">
                  <strong>Pedidos especiales:</strong> {appointment.special_requests}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredAppointments.length === 0 && (
        <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {searchTerm ? 'No se encontraron turnos' : 'No hay turnos'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? 'Intenta con otros términos de búsqueda'
              : 'Los nuevos turnos aparecerán aquí'
            }
          </p>
          {!searchTerm && (
            <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 transform hover:scale-105">
              Crear Primer Turno
            </button>
          )}
        </div>
      )}
    </div>
  );
};