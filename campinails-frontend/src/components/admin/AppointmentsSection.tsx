import React, { useState, useEffect } from 'react';
import { appointmentService } from '../../services/api';
import type { Appointment } from '../../types';
import { Clock, Plus, Filter, Search, Calendar, User, Phone, Mail, CheckCircle, XCircle, AlertCircle, DollarSign, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../ui/Toast';
import { Modal } from '../ui/Modal';

export const AppointmentsSection: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toasts, removeToast, success, error } = useToast();

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

  const handleConfirmAppointment = async () => {
    if (!selectedAppointment) return;
    
    setIsProcessing(true);
    try {
      await appointmentService.update(selectedAppointment.id, {
        status: 'confirmed',
        deposit_paid: true,
        deposit_paid_at: new Date().toISOString()
      });
      
      success('Turno confirmado', 'El turno ha sido confirmado exitosamente');
      loadAppointments();
      setShowConfirmModal(false);
    } catch (err) {
      console.error('Error al confirmar turno:', err);
      error('Error', 'No se pudo confirmar el turno');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;
    
    if (!cancelReason.trim()) {
      error('Error', 'Debes ingresar un motivo de cancelación');
      return;
    }
    
    setIsProcessing(true);
    try {
      await appointmentService.update(selectedAppointment.id, {
        status: 'cancelled',
        admin_notes: `Cancelado: ${cancelReason}`
      });
      
      success('Turno cancelado', 'El turno ha sido cancelado exitosamente');
      loadAppointments();
      setShowCancelModal(false);
      setCancelReason('');
    } catch (err) {
      console.error('Error al cancelar turno:', err);
      error('Error', 'No se pudo cancelar el turno');
    } finally {
      setIsProcessing(false);
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

              {/* Price and Payment Status */}
              <div className="flex flex-col items-end space-y-2">
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
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button className="p-2 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-200">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-2xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors duration-200">
                  <Mail className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                {appointment.status === 'pending_deposit' && (
                  <button 
                    onClick={() => {
                      setSelectedAppointment(appointment);
                      setShowConfirmModal(true);
                    }}
                    className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-xl hover:bg-green-600 transition-colors flex items-center space-x-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Confirmar</span>
                  </button>
                )}
                
                {(appointment.status === 'pending_deposit' || appointment.status === 'confirmed') && (
                  <button 
                    onClick={() => {
                      setSelectedAppointment(appointment);
                      setShowCancelModal(true);
                    }}
                    className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-xl hover:bg-red-600 transition-colors flex items-center space-x-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancelar</span>
                  </button>
                )}
                
                {appointment.status === 'confirmed' && !appointment.deposit_paid && (
                  <button 
                    onClick={() => {
                      setSelectedAppointment(appointment);
                      setShowConfirmModal(true);
                    }}
                    className="px-3 py-1.5 bg-yellow-500 text-white text-sm rounded-xl hover:bg-yellow-600 transition-colors flex items-center space-x-1"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Registrar Pago</span>
                  </button>
                )}
                
                {appointment.status === 'confirmed' && (
                  <button 
                    onClick={() => {
                      // Marcar como completado
                      appointmentService.update(appointment.id, { status: 'completed' })
                        .then(() => {
                          success('Turno completado', 'El turno ha sido marcado como completado');
                          loadAppointments();
                        })
                        .catch(err => {
                          console.error('Error al completar turno:', err);
                          error('Error', 'No se pudo completar el turno');
                        });
                    }}
                    className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-xl hover:bg-blue-600 transition-colors flex items-center space-x-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Completar</span>
                  </button>
                )}
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
      
      {/* Confirm Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirmar Turno"
        size="md"
      >
        <div className="space-y-6">
          {selectedAppointment && (
            <div className="bg-green-50 rounded-2xl p-4">
              <h3 className="font-semibold text-green-800 mb-3">Detalles del Turno</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Cliente:</span>
                  <span className="font-medium text-green-900">{selectedAppointment.client?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Servicio:</span>
                  <span className="font-medium text-green-900">{selectedAppointment.service?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Fecha:</span>
                  <span className="font-medium text-green-900">
                    {format(new Date(selectedAppointment.scheduled_at), 'EEEE, d MMMM yyyy', { locale: es })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Hora:</span>
                  <span className="font-medium text-green-900">
                    {format(new Date(selectedAppointment.scheduled_at), 'HH:mm')}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-green-200">
                  <span className="text-green-700">Seña:</span>
                  <span className="font-medium text-green-900">{formatCurrency(selectedAppointment.deposit_amount)}</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-blue-50 rounded-2xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-800">Confirmar Pago</h3>
            </div>
            <p className="text-sm text-blue-700">
              Al confirmar este turno, estás verificando que el pago de la seña ha sido recibido correctamente.
            </p>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-colors duration-200 font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmAppointment}
              disabled={isProcessing}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Procesando...</span>
                </div>
              ) : (
                'Confirmar Turno'
              )}
            </button>
          </div>
        </div>
      </Modal>
      
      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancelar Turno"
        size="md"
      >
        <div className="space-y-6">
          {selectedAppointment && (
            <div className="bg-red-50 rounded-2xl p-4">
              <h3 className="font-semibold text-red-800 mb-3">Detalles del Turno</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-red-700">Cliente:</span>
                  <span className="font-medium text-red-900">{selectedAppointment.client?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-700">Servicio:</span>
                  <span className="font-medium text-red-900">{selectedAppointment.service?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-700">Fecha:</span>
                  <span className="font-medium text-red-900">
                    {format(new Date(selectedAppointment.scheduled_at), 'EEEE, d MMMM yyyy', { locale: es })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-700">Hora:</span>
                  <span className="font-medium text-red-900">
                    {format(new Date(selectedAppointment.scheduled_at), 'HH:mm')}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo de cancelación
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-red-100 focus:border-red-300 transition-all duration-300 resize-none"
              placeholder="Ingresa el motivo de la cancelación..."
            />
          </div>
          
          <div className="bg-yellow-50 rounded-2xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-yellow-800">Importante</h3>
            </div>
            <p className="text-sm text-yellow-700">
              Al cancelar este turno, se liberará el horario para otros clientes. Si el cliente ya pagó la seña, considera ofrecer un reembolso o reprogramación.
            </p>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => setShowCancelModal(false)}
              className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-colors duration-200 font-medium"
            >
              Volver
            </button>
            <button
              onClick={handleCancelAppointment}
              disabled={isProcessing}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl hover:from-red-600 hover:to-pink-600 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Procesando...</span>
                </div>
              ) : (
                'Cancelar Turno'
              )}
            </button>
          </div>
        </div>
      </Modal>
      
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};