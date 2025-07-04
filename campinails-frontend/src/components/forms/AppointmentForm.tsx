import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Modal } from '../ui/Modal';
import { Calendar, Clock, User, Phone, Mail, MessageSquare, Save, X, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { appointmentService, clientService } from '../../services/api';
import type { Appointment, Service, Employee, Client } from '../../types';
import { format, parse, addMinutes } from 'date-fns';
import { CustomDatePicker } from '../CustomDatePicker';

const schema = yup.object({
  service_id: yup.number().required('Servicio es requerido'),
  client_id: yup.number().nullable(),
  employee_id: yup.number().nullable(),
  scheduled_at_date: yup.string().required('Fecha es requerida'),
  scheduled_at_time: yup.string().required('Hora es requerida'),
  status: yup.string().required('Estado es requerido'),
  name: yup.string().when('client_id', {
    is: (val: any) => !val,
    then: (schema) => schema.required('Nombre es requerido'),
    otherwise: (schema) => schema.optional(),
  }),
  whatsapp: yup.string().when('client_id', {
    is: (val: any) => !val,
    then: (schema) => schema.required('WhatsApp es requerido'),
    otherwise: (schema) => schema.optional(),
  }),
  email: yup.string().email('Email inválido').optional(),
  special_requests: yup.string().optional(),
});

interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  appointment: Appointment | null;
  initialDate: string | null;
  initialTime: string | null;
  services: Service[];
  employees: Employee[];
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  appointment,
  initialDate,
  initialTime,
  services,
  employees,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [isNewClient, setIsNewClient] = useState(false);
  const [endsAt, setEndsAt] = useState('');

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
      client_id: undefined,
      employee_id: undefined,
      scheduled_at_date: '',
      scheduled_at_time: '',
      status: 'pending_deposit',
      name: '',
      whatsapp: '',
      email: '',
      special_requests: '',
    },
  });

  const watchedServiceId = watch('service_id');
  const watchedClientId = watch('client_id');
  const watchedScheduledAtTime = watch('scheduled_at_time');

  // Nuevo estado para la fecha seleccionada (sincronizado con react-hook-form)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialDate ? new Date(initialDate) : undefined
  );

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (appointment) {
      const appointmentDate = new Date(appointment.scheduled_at);
      
              reset({
          service_id: appointment.service_id,
          client_id: appointment.client_id,
          employee_id: appointment.employee_id || undefined,
          scheduled_at_date: format(appointmentDate, 'yyyy-MM-dd'),
          scheduled_at_time: format(appointmentDate, 'HH:mm'),
          status: appointment.status,
          name: appointment.client?.name || '',
          whatsapp: appointment.client?.whatsapp || '',
          email: appointment.client?.email || '',
          special_requests: appointment.special_requests || '',
        });
        
        setIsNewClient(false);
      
      // Calcular hora de fin
      const endDate = new Date(appointment.ends_at);
      setEndsAt(format(endDate, 'HH:mm'));
    } else {
      reset({
        service_id: services.length > 0 ? services[0].id : 0,
        client_id: undefined,
        employee_id: undefined,
        scheduled_at_date: initialDate || format(new Date(), 'yyyy-MM-dd'),
        scheduled_at_time: initialTime || '09:00',
        status: 'pending_deposit',
        name: '',
        whatsapp: '',
        email: '',
        special_requests: '',
      });
      
      setIsNewClient(true);
      
      // Calcular hora de fin basada en la duración del servicio
      if (services.length > 0) {
        const service = services[0];
        const startTime = initialTime || '09:00';
        const startTimeParsed = parse(startTime, 'HH:mm', new Date());
        const endTimeParsed = addMinutes(startTimeParsed, service.duration_minutes);
        setEndsAt(format(endTimeParsed, 'HH:mm'));
      }
    }
  }, [appointment, initialDate, initialTime, services, reset]);

  // Sincronizar el valor de react-hook-form con el date picker visual
  useEffect(() => {
    if (selectedDate) {
      setValue('scheduled_at_date', selectedDate.toISOString().slice(0, 10));
    }
  }, [selectedDate, setValue]);

  useEffect(() => {
    if (watchedServiceId && watchedScheduledAtTime) {
      const service = services.find(s => s.id === Number(watchedServiceId));
      if (service) {
        const startTimeParsed = parse(watchedScheduledAtTime, 'HH:mm', new Date());
        const endTimeParsed = addMinutes(startTimeParsed, service.duration_minutes);
        setEndsAt(format(endTimeParsed, 'HH:mm'));
      }
    }
  }, [watchedServiceId, watchedScheduledAtTime, services]);

  useEffect(() => {
    if (watchedClientId) {
      const client = clients.find(c => c.id === Number(watchedClientId));
      if (client) {
        setValue('name', client.name);
        setValue('whatsapp', client.whatsapp);
        setValue('email', client.email || '');
        setIsNewClient(false);
      }
    }
  }, [watchedClientId, clients, setValue]);

  const loadClients = async () => {
    try {
      const clientsData = await clientService.getAll();
      setClients(clientsData);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Asegurarse de que la hora esté en formato HH:MM
      const scheduledAt = `${data.scheduled_at_date} ${data.scheduled_at_time}`;
      
      if (appointment) {
        // Actualizar turno existente
        await appointmentService.update(appointment.id, {
          service_id: Number(data.service_id),
          employee_id: data.employee_id ? Number(data.employee_id) : undefined,
          scheduled_at: scheduledAt,
          status: data.status,
          special_requests: data.special_requests,
        });
        
        onSuccess();
      } else {
        // Crear nuevo turno
        let response;
        if (isNewClient) {
          // Crear nuevo cliente y turno
          response = await appointmentService.create({
            service_id: Number(data.service_id),
            employee_id: data.employee_id ? Number(data.employee_id) : undefined,
            name: data.name,
            whatsapp: data.whatsapp,
            email: data.email || undefined,
            scheduled_at: scheduledAt,
            special_requests: data.special_requests || undefined,
          });
        } else {
          // Crear turno con cliente existente
          response = await appointmentService.create({
            service_id: Number(data.service_id),
            employee_id: data.employee_id ? Number(data.employee_id) : undefined,
            client_id: Number(data.client_id),
            scheduled_at: scheduledAt,
            special_requests: data.special_requests || undefined,
          });
        }
        
        // Si requiere pago, redirigir a MercadoPago
        console.log('Response from appointment creation:', response);
        
        if (response.requires_payment && response.payment_url) {
          console.log('Opening payment URL:', response.payment_url);
          window.open(response.payment_url, '_blank');
          alert('Tu turno ha sido reservado. Por favor, completa el pago de la seña para confirmarlo.');
        } else {
          console.log('No payment required or no payment URL');
        }
        
        onSuccess();
      }
    } catch (err: any) {
      console.error('Error saving appointment:', err);
      alert(err.response?.data?.message || 'Error al crear el turno');
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
      title={appointment ? 'Editar Turno' : 'Nuevo Turno'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Fecha y hora */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4" />
              <span>Fecha</span>
            </label>
            <CustomDatePicker
              selected={selectedDate}
              onSelect={date => setSelectedDate(date)}
            />
            {errors.scheduled_at_date && (
              <p className="mt-1 text-sm text-red-500">{errors.scheduled_at_date.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4" />
                <span>Hora inicio</span>
              </label>
              <input
                {...register('scheduled_at_time')}
                type="time"
                step="1800"
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all duration-300"
              />
              {errors.scheduled_at_time && (
                <p className="mt-1 text-sm text-red-500">{errors.scheduled_at_time.message}</p>
              )}
            </div>
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4" />
                <span>Hora fin</span>
              </label>
              <input
                type="time"
                value={endsAt}
                disabled
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-gray-50 text-gray-500"
              />
              <p className="mt-1 text-xs text-gray-500">Calculado automáticamente</p>
            </div>
          </div>
        </div>

        {/* Servicio y empleado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Servicio
            </label>
            <select
              {...register('service_id')}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all duration-300"
            >
              {services.map(service => (
                <option key={service.id} value={service.id}>
                  {service.name} - {formatCurrency(service.price)}
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
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all duration-300"
            >
              <option value="">Seleccionar empleado</option>
              {employees.map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Estado */}
        {appointment && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              {...register('status')}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all duration-300"
            >
              <option value="pending_deposit">Pendiente de Seña</option>
              <option value="confirmed">Confirmado</option>
              <option value="completed">Completado</option>
              <option value="cancelled">Cancelado</option>
              <option value="no_show">No se presentó</option>
              <option value="rescheduled">Reprogramado</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-500">{errors.status.message}</p>
            )}
          </div>
        )}

        {/* Cliente */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Información del Cliente</h3>
            
            {!appointment && (
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setIsNewClient(false)}
                  className={`px-3 py-1 rounded-xl text-sm font-medium transition-colors duration-200 ${
                    !isNewClient
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Cliente Existente
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsNewClient(true);
                    setValue('client_id', undefined);
                  }}
                  className={`px-3 py-1 rounded-xl text-sm font-medium transition-colors duration-200 ${
                    isNewClient
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Nuevo Cliente
                </button>
              </div>
            )}
          </div>

          {!isNewClient && !appointment ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Cliente
              </label>
              <select
                {...register('client_id')}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all duration-300"
              >
                <option value="">Seleccionar cliente</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name} - {client.whatsapp}
                  </option>
                ))}
              </select>
              {errors.client_id && (
                <p className="mt-1 text-sm text-red-500">{errors.client_id.message}</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4" />
                  <span>Nombre completo</span>
                </label>
                <input
                  {...register('name')}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all duration-300"
                  placeholder="Ej: María González"
                  disabled={appointment && !isNewClient}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4" />
                  <span>WhatsApp</span>
                </label>
                <input
                  {...register('whatsapp')}
                  type="tel"
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all duration-300"
                  placeholder="11 1234-5678"
                  disabled={appointment && !isNewClient}
                />
                {errors.whatsapp && (
                  <p className="mt-1 text-sm text-red-500">{errors.whatsapp.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4" />
                  <span>Email (opcional)</span>
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all duration-300"
                  placeholder="maria@email.com"
                  disabled={appointment && !isNewClient}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Pedidos especiales */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
            <MessageSquare className="w-4 h-4" />
            <span>Pedidos especiales (opcional)</span>
          </label>
          <textarea
            {...register('special_requests')}
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all duration-300 resize-none"
            placeholder="Diseños especiales, colores preferidos, alergias, etc."
          />
        </div>

        {/* Información de pago */}
        {appointment && (
          <div className="bg-gray-50 rounded-2xl p-4">
            <h4 className="font-medium text-gray-800 mb-3">Información de Pago</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Precio total:</p>
                <p className="font-semibold text-gray-800">{formatCurrency(appointment.total_price)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Seña:</p>
                <p className="font-semibold text-gray-800">
                  {formatCurrency(appointment.deposit_amount)}
                  {appointment.deposit_paid && (
                    <span className="ml-2 text-green-600">✓ Pagada</span>
                  )}
                </p>
              </div>
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
            className="flex-1 py-3 px-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl hover:from-pink-600 hover:to-rose-600 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{appointment ? 'Actualizar' : 'Crear'} Turno</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};