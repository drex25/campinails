import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Modal } from '../ui/Modal';
import { CreditCard, DollarSign, Smartphone, Save, X } from 'lucide-react';
import { appointmentService } from '../../services/api';
import type { Appointment } from '../../types';

const schema = yup.object({
  appointment_id: yup.number().required('Debes seleccionar un turno'),
  amount: yup.number().required('El monto es requerido').min(1, 'El monto debe ser mayor a 0'),
  payment_method: yup.string().required('El método de pago es requerido'),
  notes: yup.string().optional(),
});

interface PaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      appointment_id: 0,
      amount: 0,
      payment_method: 'cash',
      notes: '',
    },
  });

  const watchedAppointmentId = watch('appointment_id');
  const watchedPaymentMethod = watch('payment_method');

  useEffect(() => {
    if (isOpen) {
      loadAppointments();
    }
  }, [isOpen]);

  useEffect(() => {
    if (watchedAppointmentId) {
      const appointment = appointments.find(a => a.id === Number(watchedAppointmentId));
      setSelectedAppointment(appointment || null);
      
      if (appointment) {
        setValue('amount', appointment.deposit_amount);
      }
    }
  }, [watchedAppointmentId, appointments, setValue]);

  const loadAppointments = async () => {
    try {
      const data = await appointmentService.getAll({ status: 'pending_deposit' });
      setAppointments(data);
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Simular procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Actualizar el estado del turno a confirmado
      if (selectedAppointment) {
        await appointmentService.update(selectedAppointment.id, {
          deposit_paid: true,
          status: 'confirmed'
        });
      }
      
      reset();
      onSuccess();
    } catch (error) {
      console.error('Error processing payment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Pago"
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Selección de turno */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecciona el turno
          </label>
          <select
            {...register('appointment_id')}
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-300 transition-all duration-300"
          >
            <option value="">Selecciona un turno</option>
            {appointments.map(appointment => (
              <option key={appointment.id} value={appointment.id}>
                {appointment.client?.name} - {appointment.service?.name} - {new Date(appointment.scheduled_at).toLocaleDateString()}
              </option>
            ))}
          </select>
          {errors.appointment_id && (
            <p className="mt-1 text-sm text-red-500">{errors.appointment_id.message}</p>
          )}
        </div>

        {/* Detalles del turno seleccionado */}
        {selectedAppointment && (
          <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Cliente:</span>
              <span className="font-medium text-gray-800">{selectedAppointment.client?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Servicio:</span>
              <span className="font-medium text-gray-800">{selectedAppointment.service?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Fecha:</span>
              <span className="font-medium text-gray-800">
                {new Date(selectedAppointment.scheduled_at).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Hora:</span>
              <span className="font-medium text-gray-800">
                {new Date(selectedAppointment.scheduled_at).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-700">Total:</span>
              <span className="font-bold text-gray-800">{formatCurrency(selectedAppointment.total_price)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Seña:</span>
              <span className="font-bold text-emerald-600">{formatCurrency(selectedAppointment.deposit_amount)}</span>
            </div>
          </div>
        )}

        {/* Método de pago */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Método de pago
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { id: 'cash', name: 'Efectivo', icon: DollarSign, color: 'from-green-500 to-emerald-500' },
              { id: 'card', name: 'Tarjeta', icon: CreditCard, color: 'from-blue-500 to-indigo-500' },
              { id: 'mercadopago', name: 'MercadoPago', icon: Smartphone, color: 'from-purple-500 to-pink-500' },
            ].map(method => {
              const Icon = method.icon;
              return (
                <label
                  key={method.id}
                  className={`flex items-center space-x-3 p-3 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${
                    watchedPaymentMethod === method.id
                      ? 'border-emerald-300 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    {...register('payment_method')}
                    value={method.id}
                    className="sr-only"
                  />
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${method.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-gray-800">{method.name}</span>
                </label>
              );
            })}
          </div>
          {errors.payment_method && (
            <p className="mt-1 text-sm text-red-500">{errors.payment_method.message}</p>
          )}
        </div>

        {/* Monto */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="w-4 h-4" />
            <span>Monto</span>
          </label>
          <input
            {...register('amount')}
            type="number"
            min="0"
            step="100"
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-300 transition-all duration-300"
            placeholder="0"
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-500">{errors.amount.message}</p>
          )}
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas (opcional)
          </label>
          <textarea
            {...register('notes')}
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-300 transition-all duration-300 resize-none"
            placeholder="Notas adicionales sobre el pago..."
          />
        </div>

        {/* Botones */}
        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-colors duration-200 font-medium flex items-center justify-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Cancelar</span>
          </button>
          <button
            type="submit"
            disabled={isLoading || !selectedAppointment}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-2xl hover:from-emerald-600 hover:to-green-600 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Registrar Pago</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};