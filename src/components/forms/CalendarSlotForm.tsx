import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Modal } from '../ui/Modal';
import { Calendar, Clock, User, Save, X, AlertTriangle } from 'lucide-react';
import { timeSlotService } from '../../services/api';
import type { TimeSlot, Service, Employee } from '../../types';
import { addMinutes, format, parse } from 'date-fns';

const schema = yup.object({
  service_id: yup.number().required('Servicio es requerido'),
  employee_id: yup.number().nullable(),
  date: yup.string().required('Fecha es requerida'),
  start_time: yup.string().required('Hora de inicio es requerida'),
  status: yup.string().required('Estado es requerido'),
  notes: yup.string().optional(),
});

interface CalendarSlotFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  slot: TimeSlot | null;
  date: string | null;
  time: string | null;
  services: Service[];
  employees: Employee[];
}

export const CalendarSlotForm: React.FC<CalendarSlotFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  slot,
  date,
  time,
  services,
  employees,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingBulk, setIsCreatingBulk] = useState(false);
  const [endTime, setEndTime] = useState('');

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
      service_id: 0,
      employee_id: null,
      date: '',
      start_time: '',
      end_time: '',
      status: 'available',
      notes: '',
    },
  });

  const watchedServiceId = watch('service_id');
  const watchedStartTime = watch('start_time');

  useEffect(() => {
    if (slot) {
      reset({
        service_id: slot.service_id,
        employee_id: slot.employee_id || null,
        date: slot.date,
        start_time: slot.start_time,
        status: slot.status,
        notes: slot.notes || '',
      });
      setEndTime(slot.end_time);
    } else if (date && time) {
      reset({
        service_id: services.length > 0 ? services[0].id : 0,
        employee_id: null,
        date: date,
        start_time: time,
        status: 'available',
        notes: '',
      });
      
      // Calcular hora de fin basada en la duración del servicio
      if (services.length > 0) {
        const service = services[0];
        const startTimeParsed = parse(time, 'HH:mm', new Date());
        const endTimeParsed = addMinutes(startTimeParsed, service.duration_minutes);
        setEndTime(format(endTimeParsed, 'HH:mm'));
      }
    } else {
      reset({
        service_id: services.length > 0 ? services[0].id : 0,
        employee_id: null,
        date: format(new Date(), 'yyyy-MM-dd'),
        start_time: '09:00',
        status: 'available',
        notes: '',
      });
      
      // Calcular hora de fin basada en la duración del servicio
      if (services.length > 0) {
        const service = services[0];
        const startTimeParsed = parse('09:00', 'HH:mm', new Date());
        const endTimeParsed = addMinutes(startTimeParsed, service.duration_minutes);
        setEndTime(format(endTimeParsed, 'HH:mm'));
      }
    }
  }, [slot, date, time, services, reset]);

  useEffect(() => {
    if (watchedServiceId && watchedStartTime) {
      const service = services.find(s => s.id === Number(watchedServiceId));
      if (service) {
        const startTimeParsed = parse(watchedStartTime, 'HH:mm', new Date());
        const endTimeParsed = addMinutes(startTimeParsed, service.duration_minutes);
        setEndTime(format(endTimeParsed, 'HH:mm'));
      }
    }
  }, [watchedServiceId, watchedStartTime, services]);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      if (isCreatingBulk) {
        // Crear slots en bulk
        await timeSlotService.createBulk({
          service_id: Number(data.service_id),
          start_date: data.date,
          end_date: data.date, // Mismo día para un solo día
          start_time: data.start_time,
          end_time: '18:00', // Fin del día laboral
          days_of_week: [0, 1, 2, 3, 4, 5, 6], // Todos los días
        });
      } else if (slot) {
        // Actualizar slot existente
        await timeSlotService.update(slot.id, {
          status: data.status,
          notes: data.notes,
        });
      } else {
        // Crear nuevo slot
        await timeSlotService.create({
          service_id: Number(data.service_id),
          employee_id: data.employee_id ? Number(data.employee_id) : undefined,
          date: data.date,
          start_time: data.start_time,
          end_time: endTime,
          status: data.status,
          notes: data.notes,
        });
      }
      onSuccess();
    } catch (err: any) {
      console.error('Error saving slot:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={slot ? 'Editar Horario' : 'Nuevo Horario'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Información básica */}
        <div className="space-y-4">
          {!slot && (
            <>
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>Fecha</span>
                </label>
                <input
                  {...register('date')}
                  type="date"
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-300 transition-all duration-300"
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-500">{errors.date.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4" />
                    <span>Hora de inicio</span>
                  </label>
                  <input
                    {...register('start_time')}
                    type="time"
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-300 transition-all duration-300"
                  />
                  {errors.start_time && (
                    <p className="mt-1 text-sm text-red-500">{errors.start_time.message}</p>
                  )}
                </div>
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4" />
                    <span>Hora de fin</span>
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    disabled
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-gray-50 text-gray-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">Calculado automáticamente</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Servicio
                </label>
                <select
                  {...register('service_id')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-300 transition-all duration-300"
                >
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name} ({service.duration_minutes} min)
                    </option>
                  ))}
                </select>
                {errors.service_id && (
                  <p className="mt-1 text-sm text-red-500">{errors.service_id.message}</p>
                )}
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4" />
                  <span>Empleado (opcional)</span>
                </label>
                <select
                  {...register('employee_id')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-300 transition-all duration-300"
                >
                  <option value="">Cualquier empleado</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              {...register('status')}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-300 transition-all duration-300"
            >
              <option value="available">Disponible</option>
              <option value="blocked">Bloqueado</option>
              {slot && slot.status === 'reserved' && (
                <option value="reserved">Reservado</option>
              )}
              {slot && slot.status === 'cancelled' && (
                <option value="cancelled">Cancelado</option>
              )}
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-500">{errors.status.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas (opcional)
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-300 transition-all duration-300 resize-none"
              placeholder="Notas adicionales..."
            />
          </div>
        </div>

        {!slot && (
          <div className="flex items-center space-x-3 bg-blue-50 p-4 rounded-2xl">
            <input
              type="checkbox"
              id="createBulk"
              checked={isCreatingBulk}
              onChange={() => setIsCreatingBulk(!isCreatingBulk)}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <div>
              <label htmlFor="createBulk" className="text-sm font-medium text-blue-800 cursor-pointer">
                Crear múltiples slots para este día
              </label>
              <p className="text-xs text-blue-600">
                Se crearán slots cada {services.find(s => s.id === Number(watchedServiceId))?.duration_minutes || 60} minutos desde la hora de inicio hasta las 18:00
              </p>
            </div>
          </div>
        )}

        {/* Información del turno si está reservado */}
        {slot && slot.appointment && (
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-blue-800">Información del Turno</h4>
            </div>
            <div className="space-y-1 text-sm text-blue-700">
              <p><strong>Cliente:</strong> {slot.appointment.client?.name}</p>
              <p><strong>Servicio:</strong> {slot.service?.name}</p>
              <p><strong>Estado:</strong> {
                slot.appointment.status === 'confirmed' ? 'Confirmado' :
                slot.appointment.status === 'pending_deposit' ? 'Pendiente de seña' :
                slot.appointment.status === 'completed' ? 'Completado' :
                slot.appointment.status === 'cancelled' ? 'Cancelado' : 
                slot.appointment.status
              }</p>
              {slot.appointment.special_requests && (
                <p><strong>Pedidos especiales:</strong> {slot.appointment.special_requests}</p>
              )}
            </div>
          </div>
        )}

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
            disabled={isLoading}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{slot ? 'Actualizar' : 'Crear'} Horario</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};