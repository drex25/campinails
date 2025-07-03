import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { format, addDays, parseISO, parse, addMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import { appointmentService, serviceService, timeSlotService, employeeService } from '../services/api';
import type { Service, TimeSlot, Employee, Appointment } from '../types';
import { Calendar, Clock, User, Phone, Mail, MessageSquare, Sparkles, CheckCircle, ArrowRight, ArrowLeft, CreditCard } from 'lucide-react';
import { Preloader } from './Preloader';
import { PaymentModal } from './PaymentModal';

const schema = yup.object({
  service_id: yup.number().required('Debes seleccionar un servicio'),
  name: yup.string().required('Nombre es requerido'),
  whatsapp: yup.string().required('WhatsApp es requerido'),
  email: yup.string().email('Email inválido').optional(),
  special_requests: yup.string().optional(),
});

interface AppointmentFormData {
  service_id: number;
  name: string;
  whatsapp: string;
  email?: string;
  special_requests?: string;
}

type Step = 'service' | 'professional' | 'datetime' | 'details' | 'confirmation';

export const AppointmentForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>('service');
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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
    const loadInitialData = async () => {
      setIsInitialLoading(true);
      try {
        const [servicesData] = await Promise.all([
          serviceService.getPublic(),
          new Promise(resolve => setTimeout(resolve, 2000))
        ]);
        setServices(servicesData);
      } catch (error) {
        console.error('Error cargando servicios:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (watchedServiceId) {
      const service = services.find(s => s.id === watchedServiceId);
      setSelectedService(service || null);
      setSelectedEmployee(null);
      setSelectedDate('');
      setSelectedSlot(null);
      setAvailableSlots([]);
      if (service) {
        loadEmployeesForService(service.id);
      }
    }
  }, [watchedServiceId, services]);

  useEffect(() => {
    if (selectedService) {
      loadAvailableDays();
    }
  }, [selectedService, selectedEmployee]);

  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedDate]);

  const loadEmployeesForService = async (serviceId: number) => {
    try {
      const employeesData = await employeeService.getPublic({ service_id: serviceId, active: true });
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error cargando empleados:', error);
    }
  };

  const loadAvailableSlots = async () => {
    if (!selectedService || !selectedDate) return;
    
    try {
      const employeeId = selectedEmployee?.id;
      const slots = await timeSlotService.getAvailableSlots(selectedService.id, selectedDate, employeeId);
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error cargando slots disponibles:', error);
      setAvailableSlots([]);
    }
  };

  const loadAvailableDays = async () => {
    if (!selectedService) return;
    const today = new Date();
    const startDate = format(addDays(today, 1), 'yyyy-MM-dd');
    const endDate = format(addDays(today, 30), 'yyyy-MM-dd');
    try {
      const days = await timeSlotService.getAvailableDays(
        selectedService.id,
        startDate,
        endDate,
        selectedEmployee?.id
      );
      setAvailableDays(days);
    } catch (error) {
      setAvailableDays([]);
    }
  };

  const onSubmit = async (data: AppointmentFormData) => {
    if (!selectedDate) {
      setError('Debes seleccionar una fecha');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Determinar la hora del turno
      let scheduledTime = '09:00';
      if (selectedSlot) {
        scheduledTime = selectedSlot.start_time;
      }

      // Asegurarse de que la hora esté en formato HH:MM
      const scheduledDateTime = `${selectedDate} ${scheduledTime}`;
      
      const appointment = await appointmentService.create({
        service_id: data.service_id,
        employee_id: selectedEmployee?.id,
        name: data.name,
        whatsapp: data.whatsapp,
        email: data.email,
        scheduled_at: scheduledDateTime,
        special_requests: data.special_requests,
      });
      
      setCreatedAppointment(appointment);
      
      // Si el servicio requiere seña, mostrar modal de pago
      if (selectedService?.requires_deposit && appointment.deposit_amount > 0) {
        setShowPaymentModal(true);
      } else {
        setIsSuccess(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear el turno');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setIsSuccess(true);
  };

  const nextStep = () => {
    const steps: Step[] = ['service', 'professional', 'datetime', 'details', 'confirmation'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: Step[] = ['service', 'professional', 'datetime', 'details', 'confirmation'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const canProceedFromService = selectedService !== null;
  const canProceedFromProfessional = true;
  const canProceedFromDateTime = selectedDate && (selectedSlot || availableSlots.length === 0);
  const canProceedFromDetails = watch('name') && watch('whatsapp');

  const getStepProgress = () => {
    const steps: Step[] = ['service', 'professional', 'datetime', 'details', 'confirmation'];
    return ((steps.indexOf(currentStep) + 1) / steps.length) * 100;
  };

  const generateCalendarDays = () => {
    const today = new Date();
    const days = [];
    
    for (let i = 1; i <= 30; i++) {
      const date = addDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const isAvailable = availableDays.includes(dateStr);
      const isSelected = selectedDate === dateStr;
      
      days.push({
        date: dateStr,
        day: format(date, 'd'),
        dayName: format(date, 'EEE', { locale: es }),
        isAvailable,
        isSelected,
        fullDate: date
      });
    }
    
    return days;
  };

  if (isInitialLoading) {
    return <Preloader message="Cargando servicios disponibles..." />;
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center transform animate-pulse">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              ¡Perfecto! 🎉
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {selectedService?.requires_deposit 
                ? 'Tu turno ha sido confirmado y el pago procesado exitosamente. Te contactaremos por WhatsApp con todos los detalles.'
                : 'Tu solicitud de turno ha sido enviada exitosamente. Te contactaremos por WhatsApp para confirmar y coordinar la seña.'
              }
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-4 rounded-2xl font-semibold hover:from-pink-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-105"
            >
              Solicitar Otro Turno
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                    Campi Nails
                  </h1>
                  <p className="text-gray-600 text-sm">Tu momento de belleza te espera</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Paso {['service', 'professional', 'datetime', 'details', 'confirmation'].indexOf(currentStep) + 1} de 5</div>
                <div className="w-32 h-2 bg-gray-200 rounded-full mt-1">
                  <div 
                    className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transition-all duration-500"
                    style={{ width: `${getStepProgress()}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-4 py-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Service Selection */}
            {currentStep === 'service' && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">¿Qué servicio te gustaría?</h2>
                  <p className="text-gray-600">Elige el tratamiento perfecto para ti</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className={`relative bg-white rounded-3xl p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                        selectedService?.id === service.id
                          ? 'ring-4 ring-pink-300 shadow-2xl'
                          : 'shadow-lg hover:shadow-xl'
                      }`}
                      onClick={() => {
                        setSelectedService(service);
                        setValue('service_id', service.id);
                      }}
                    >
                      {selectedService?.id === service.id && (
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                      )}
                      
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-pink-100 to-rose-100 rounded-2xl flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-pink-600" />
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-800">${service.price.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">{service.duration_minutes} min</div>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">{service.name}</h3>
                      {service.description && (
                        <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                      )}
                      
                      {service.requires_deposit && (
                        <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-3">
                          <div className="text-sm text-pink-700">
                            <strong>Seña requerida:</strong> ${Math.round(service.price * service.deposit_percentage / 100).toLocaleString()} ({service.deposit_percentage}%)
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {errors.service_id && (
                  <div className="text-center">
                    <p className="text-red-500 text-sm">{errors.service_id.message}</p>
                  </div>
                )}

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!canProceedFromService}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-4 rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-pink-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                  >
                    <span>Continuar</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Professional Selection */}
            {currentStep === 'professional' && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">¿Tienes alguna preferencia?</h2>
                  <p className="text-gray-600">Puedes elegir tu profesional favorito o dejar que asignemos el mejor disponible</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div
                    className={`bg-white rounded-3xl p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                      selectedEmployee === null
                        ? 'ring-4 ring-pink-300 shadow-2xl'
                        : 'shadow-lg hover:shadow-xl'
                    }`}
                    onClick={() => setSelectedEmployee(null)}
                  >
                    {selectedEmployee === null && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    )}
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Cualquier profesional</h3>
                      <p className="text-gray-600 text-sm">Te asignaremos el mejor profesional disponible para tu horario preferido</p>
                    </div>
                  </div>

                  {employees.map((employee) => (
                    <div
                      key={employee.id}
                      className={`bg-white rounded-3xl p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                        selectedEmployee?.id === employee.id
                          ? 'ring-4 ring-pink-300 shadow-2xl'
                          : 'shadow-lg hover:shadow-xl'
                      }`}
                      onClick={() => setSelectedEmployee(employee)}
                    >
                      {selectedEmployee?.id === employee.id && (
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                      )}
                      
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <User className="w-8 h-8 text-pink-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{employee.name}</h3>
                        {employee.specialties && employee.specialties.length > 0 && (
                          <p className="text-gray-600 text-sm">{employee.specialties.join(', ')}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="bg-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-300 transition-all duration-300 flex items-center space-x-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Anterior</span>
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!canProceedFromProfessional}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-4 rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-pink-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                  >
                    <span>Continuar</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Date & Time Selection */}
            {currentStep === 'datetime' && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">¿Cuándo te viene mejor?</h2>
                  <p className="text-gray-600">Selecciona tu fecha y horario preferido</p>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-lg">
                  <div className="flex items-center space-x-2 mb-6">
                    <Calendar className="w-6 h-6 text-pink-600" />
                    <h3 className="text-xl font-semibold text-gray-800">Elige tu fecha</h3>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-2">
                    {generateCalendarDays().slice(0, 28).map((day, index) => (
                      <div
                        key={day.date}
                        className={`aspect-square flex flex-col items-center justify-center rounded-2xl cursor-pointer transition-all duration-300 ${
                          day.isSelected
                            ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg transform scale-105'
                            : day.isAvailable
                            ? 'bg-pink-50 text-pink-700 hover:bg-pink-100'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        onClick={() => {
                          if (day.isAvailable) {
                            setSelectedDate(day.date);
                            setSelectedSlot(null);
                          }
                        }}
                      >
                        <div className="text-xs font-medium">{day.dayName}</div>
                        <div className="text-lg font-bold">{day.day}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedDate && (
                  <div className="bg-white rounded-3xl p-6 shadow-lg">
                    <div className="flex items-center space-x-2 mb-6">
                      <Clock className="w-6 h-6 text-pink-600" />
                      <h3 className="text-xl font-semibold text-gray-800">Horarios disponibles</h3>
                    </div>
                    
                    {availableSlots.length > 0 ? (
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                        {availableSlots.map((slot, index) => (
                          <button
                            key={`${slot.employee_id}-${slot.start_time}-${index}`}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`p-4 rounded-2xl text-center transition-all duration-300 transform hover:scale-105 ${
                              selectedSlot === slot
                                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
                                : 'bg-pink-50 text-pink-700 hover:bg-pink-100'
                            }`}
                          >
                            <div className="font-semibold">{slot.start_time}</div>
                            {slot.employee && (
                              <div className="text-xs opacity-75 mt-1">{slot.employee.name}</div>
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Clock className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500">No hay horarios disponibles para esta fecha</p>
                        <p className="text-gray-400 text-sm mt-1">Por favor, selecciona otra fecha</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="bg-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-300 transition-all duration-300 flex items-center space-x-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Anterior</span>
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!canProceedFromDateTime}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-4 rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-pink-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                  >
                    <span>Continuar</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Personal Details */}
            {currentStep === 'details' && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">Cuéntanos sobre ti</h2>
                  <p className="text-gray-600">Necesitamos algunos datos para confirmar tu turno</p>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-lg space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4" />
                        <span>Nombre completo</span>
                      </label>
                      <input
                        {...register('name')}
                        type="text"
                        className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all duration-300"
                        placeholder="Tu nombre completo"
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
                        className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all duration-300"
                        placeholder="11 1234-5678"
                      />
                      {errors.whatsapp && (
                        <p className="mt-1 text-sm text-red-500">{errors.whatsapp.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4" />
                      <span>Email (opcional)</span>
                    </label>
                    <input
                      {...register('email')}
                      type="email"
                      className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all duration-300"
                      placeholder="tu@email.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                      <MessageSquare className="w-4 h-4" />
                      <span>Pedidos especiales (opcional)</span>
                    </label>
                    <textarea
                      {...register('special_requests')}
                      rows={4}
                      className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all duration-300 resize-none"
                      placeholder="Diseños especiales, colores preferidos, alergias, etc."
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="bg-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-300 transition-all duration-300 flex items-center space-x-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Anterior</span>
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!canProceedFromDetails}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-4 rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-pink-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                  >
                    <span>Revisar</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Confirmation */}
            {currentStep === 'confirmation' && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">¡Casi listo! 🎉</h2>
                  <p className="text-gray-600">Revisa los detalles de tu turno antes de confirmar</p>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-lg space-y-6">
                  <div className="border-b border-gray-100 pb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Servicio seleccionado</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-800">{selectedService?.name}</div>
                        <div className="text-sm text-gray-600">{selectedService?.duration_minutes} minutos</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-800">${selectedService?.price.toLocaleString()}</div>
                        {selectedService?.requires_deposit && (
                          <div className="text-sm text-pink-600">
                            Seña: ${Math.round((selectedService?.price || 0) * (selectedService?.deposit_percentage || 0) / 100).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-b border-gray-100 pb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Fecha y hora</h3>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5 text-pink-600" />
                        <span>{selectedDate && format(parseISO(selectedDate), 'EEEE, d MMMM yyyy', { locale: es })}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-5 h-5 text-pink-600" />
                        <span>{selectedSlot?.start_time || "09:00"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-b border-gray-100 pb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Profesional</h3>
                    <div className="flex items-center space-x-2">
                      <User className="w-5 h-5 text-pink-600" />
                      <span>{selectedEmployee?.name || selectedSlot?.employee?.name || 'Cualquier profesional disponible'}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Tus datos</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-pink-600" />
                        <span>{watch('name')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-pink-600" />
                        <span>{watch('whatsapp')}</span>
                      </div>
                      {watch('email') && (
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-pink-600" />
                          <span>{watch('email')}</span>
                        </div>
                      )}
                      {watch('special_requests') && (
                        <div className="flex items-start space-x-2">
                          <MessageSquare className="w-4 h-4 text-pink-600 mt-0.5" />
                          <span className="text-sm">{watch('special_requests')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-6">
                  <h3 className="font-semibold text-blue-800 mb-2">📋 Información importante</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Te contactaremos por WhatsApp para confirmar tu turno</li>
                    {selectedService?.requires_deposit && (
                      <li>• Deberás abonar la seña para asegurar tu reserva</li>
                    )}
                    <li>• Puedes reprogramar hasta 2 veces sin costo</li>
                    <li>• Cancelaciones con menos de 24hs pierden la seña</li>
                  </ul>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="bg-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-300 transition-all duration-300 flex items-center space-x-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Anterior</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-2xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Enviando...</span>
                      </>
                    ) : selectedService?.requires_deposit ? (
                      <>
                        <CreditCard className="w-5 h-5" />
                        <span>Confirmar y Pagar</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span>Confirmar Turno</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && createdAppointment && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          appointment={createdAppointment}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
};