import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { format, addDays } from 'date-fns';
import { appointmentService, serviceService, timeSlotService } from '../services/api';
import type { Service, TimeSlot } from '../types';

const schema = yup.object({
  service_id: yup.number().required('Debes seleccionar un servicio'),
  name: yup.string().required('Nombre es requerido'),
  whatsapp: yup.string().required('WhatsApp es requerido'),
  email: yup.string().email('Email inválido').optional(),
  slot_id: yup.number().required('Debes seleccionar un horario'),
  special_requests: yup.string().optional(),
});

interface AppointmentFormData {
  service_id: number;
  name: string;
  whatsapp: string;
  email?: string;
  slot_id: number;
  special_requests?: string;
}

export const AppointmentForm: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const watchedServiceId = watch('service_id');

  useEffect(() => {
    const loadServices = async () => {
      try {
        const servicesData = await serviceService.getPublic();
        setServices(servicesData);
      } catch (error) {
        console.error('Error cargando servicios:', error);
      }
    };
    loadServices();
  }, []);

  useEffect(() => {
    if (watchedServiceId) {
      const service = services.find(s => s.id === watchedServiceId);
      setSelectedService(service || null);
      setSelectedDate(''); // Reset fecha cuando cambia servicio
      setAvailableSlots([]); // Reset slots
      setValue('slot_id', 0); // Reset slot seleccionado
    }
  }, [watchedServiceId, services, setValue]);

  useEffect(() => {
    if (selectedService && selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedService, selectedDate]);

  const loadAvailableSlots = async () => {
    if (!selectedService || !selectedDate) return;
    
    try {
      const slots = await timeSlotService.getAvailableSlots(selectedService.id, selectedDate);
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error cargando slots disponibles:', error);
      setAvailableSlots([]);
    }
  };

  const onSubmit = async (data: AppointmentFormData) => {
    setIsLoading(true);
    setError('');

    try {
      // Obtener el slot seleccionado para enviar la fecha y hora
      const selectedSlot = availableSlots.find(slot => slot.id === data.slot_id);
      if (!selectedSlot) {
        throw new Error('Slot no encontrado');
      }

      await appointmentService.create({
        service_id: data.service_id,
        name: data.name,
        whatsapp: data.whatsapp,
        email: data.email,
        scheduled_at: `${selectedSlot.date} ${selectedSlot.start_time}`,
        special_requests: data.special_requests,
      });
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear el turno');
    } finally {
      setIsLoading(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = addDays(new Date(), 1);
    return format(tomorrow, 'yyyy-MM-dd');
  };

  const getMaxDate = () => {
    const maxDate = addDays(new Date(), 30); // Máximo 30 días adelante
    return format(maxDate, 'yyyy-MM-dd');
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-campi-pink py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="card">
            <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-green-600 text-xl">✓</span>
            </div>
            <h2 className="text-2xl font-bold text-campi-brown mb-4">
              ¡Turno Solicitado!
            </h2>
            <p className="text-gray-600 mb-6">
              Tu solicitud ha sido enviada. Te contactaremos por WhatsApp para confirmar el turno y coordinar la seña.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary w-full"
            >
              Solicitar Otro Turno
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-campi-pink py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-campi-brown mb-4">
            <span className="text-white text-2xl font-bold">C</span>
          </div>
          <h1 className="text-4xl font-bold text-campi-brown mb-2">
            Campi Nails
          </h1>
          <p className="text-lg text-gray-600">
            Solicita tu turno online
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card">
          <div className="space-y-6">
            {/* Selección de Servicio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecciona tu servicio
              </label>
              <select
                {...register('service_id')}
                className="input-field"
              >
                <option value="">Elige un servicio...</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - ${service.price.toLocaleString()} ({service.duration_minutes} min)
                  </option>
                ))}
              </select>
              {errors.service_id && (
                <p className="mt-1 text-sm text-red-600">{errors.service_id.message}</p>
              )}
            </div>

            {/* Información del servicio seleccionado */}
            {selectedService && (
              <div className="bg-campi-pink p-4 rounded-lg">
                <h3 className="font-medium text-campi-brown mb-2">
                  {selectedService.name}
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Duración: {selectedService.duration_minutes} minutos</p>
                  <p>Precio: ${selectedService.price.toLocaleString()}</p>
                  {selectedService.requires_deposit && (
                    <p>Seña: ${Math.round(selectedService.price * selectedService.deposit_percentage / 100).toLocaleString()} ({selectedService.deposit_percentage}%)</p>
                  )}
                </div>
              </div>
            )}

            {/* Selección de Fecha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={getMinDate()}
                max={getMaxDate()}
                className="input-field"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Horarios: Lunes a Sábado de 9:00 a 18:00. Mínimo 24hs de anticipación.
              </p>
            </div>

            {/* Selección de Horario */}
            {selectedDate && availableSlots.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horario Disponible
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setValue('slot_id', slot.id)}
                      className={`p-3 text-sm rounded-lg border transition-colors ${
                        watch('slot_id') === slot.id
                          ? 'bg-campi-brown text-white border-campi-brown'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-campi-brown'
                      }`}
                    >
                      {slot.start_time}
                    </button>
                  ))}
                </div>
                {errors.slot_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.slot_id.message}</p>
                )}
              </div>
            )}

            {selectedDate && availableSlots.length === 0 && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-800">
                  No hay horarios disponibles para la fecha seleccionada. 
                  Por favor, elige otra fecha.
                </p>
              </div>
            )}

            {/* Datos del Cliente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre completo
                </label>
                <input
                  {...register('name')}
                  type="text"
                  className="input-field"
                  placeholder="Tu nombre"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp
                </label>
                <input
                  {...register('whatsapp')}
                  type="tel"
                  className="input-field"
                  placeholder="11 1234-5678"
                />
                {errors.whatsapp && (
                  <p className="mt-1 text-sm text-red-600">{errors.whatsapp.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (opcional)
              </label>
              <input
                {...register('email')}
                type="email"
                className="input-field"
                placeholder="tu@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pedidos especiales (opcional)
              </label>
              <textarea
                {...register('special_requests')}
                rows={3}
                className="input-field"
                placeholder="Diseños especiales, colores preferidos, etc."
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Importante:</strong> Deberás abonar el 50% de seña para confirmar el turno. 
                Te contactaremos por WhatsApp para coordinar el pago.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !selectedDate || availableSlots.length === 0}
              className="btn-primary w-full flex justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviando solicitud...
                </div>
              ) : (
                'Solicitar Turno'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 