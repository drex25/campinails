import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { format, addDays, parseISO, parse, addMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import { appointmentService, serviceService, timeSlotService, employeeService } from '../services/api';
import type { Service, TimeSlot, Employee, Appointment, Client } from '../types';
import { Calendar, Clock, User, Phone, Mail, MessageSquare, Sparkles, CheckCircle, ArrowRight, ArrowLeft, CreditCard, Camera, Image, Trash2, Star, Heart, Scissors } from 'lucide-react';
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
  const [paymentRequired, setPaymentRequired] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPendingMessage, setShowPendingMessage] = useState(false);
  const [referencePhoto, setReferencePhoto] = useState<File | null>(null);
  const [referencePhotoPreview, setReferencePhotoPreview] = useState<string | null>(null);
  const [recentClients, setRecentClients] = useState<Client[]>([]);
  const [showRecentClients, setShowRecentClients] = useState(false);

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
      setShowRecentClients(localStorage.getItem('recentClients') !== null);
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
      // Actualizar si el servicio requiere pago
      setPaymentRequired(service?.requires_deposit || false);
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

  // Cargar clientes recientes del localStorage
  useEffect(() => {
    const savedClients = localStorage.getItem('recentClients');
    if (savedClients) {
      try {
        setRecentClients(JSON.parse(savedClients));
      } catch (e) {}
    }
  }, []);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReferencePhoto(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferencePhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveClientToRecent = (clientData: {name: string, whatsapp: string, email?: string}) => {
    const newClient = {
      id: Date.now(),
      name: clientData.name,
      whatsapp: clientData.whatsapp,
      email: clientData.email || '',
      is_active: true
    };
    
    const updatedClients = [newClient, ...recentClients.filter(c => c.whatsapp !== clientData.whatsapp).slice(0, 4)];
    localStorage.setItem('recentClients', JSON.stringify(updatedClients));
  };

  const onSubmit = async (data: AppointmentFormData) => {
    if (!selectedDate) {
      setError('Debes seleccionar una fecha');
      return;
    }

    if (!selectedSlot) {
      setError('Debes seleccionar un horario');
      return;
    }

    setIsLoading(true);
    setError('');
    
    saveClientToRecent(data);

    try {
      // Usar la hora del slot seleccionado
      const scheduledTime = selectedSlot.start_time;
      const scheduledDateTime = `${selectedDate} ${scheduledTime}`;
      
      console.log('Enviando cita con fecha/hora:', {
        selectedDate,
        selectedSlot: selectedSlot?.start_time,
        scheduledDateTime: scheduledDateTime,
        employee: selectedEmployee?.name
      });
      
      // Convert reference photo to base64 if exists
      let referencePhotoBase64 = null;
      if (referencePhoto) {
        referencePhotoBase64 = referencePhotoPreview;
      }
      
      const appointment = await appointmentService.create({
        service_id: data.service_id,
        employee_id: selectedEmployee?.id,
        name: data.name,
        whatsapp: data.whatsapp,
        email: data.email,
        scheduled_at: scheduledDateTime,
        special_requests: data.special_requests,
        reference_photo: referencePhotoBase64,
      });
      
      // Asegurarse de que tenemos el objeto de cita correcto
      const appointmentData = appointment.appointment || appointment;
      
      // Verificar que tenemos un appointment válido
      if ('id' in appointmentData) {
        setCreatedAppointment(appointmentData as Appointment);
        
        console.log('Cita creada:', {
          id: appointmentData.id,
          scheduled_at: appointmentData.scheduled_at,
          employee: appointmentData.employee?.name,
          requires_payment: selectedService?.requires_deposit && selectedService?.deposit_percentage > 0
        });
        
        // Si el servicio requiere seña, mostrar modal de pago
        if (paymentRequired && (appointmentData.deposit_amount > 0)) {
          setShowPaymentModal(true);
        } else {
          setIsSuccess(true);
        }
      } else {
        // Si no tenemos un appointment válido, mostrar error
        setError('Error al crear el turno: datos inválidos');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear el turno');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentMethod?: string) => {
    setShowPaymentModal(false);
    
    // Solo mostrar éxito inmediato para pagos que no requieren confirmación externa
    if (paymentMethod === 'cash' || paymentMethod === 'transfer') {
      setIsSuccess(true);
    } else {
      // Para pagos online, mostrar mensaje de pendiente
      setShowPendingMessage(true);
    }
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
        <div className="max-w-md w-full relative">
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-pink-300/30 to-rose-300/30 rounded-full blur-xl"></div>
          <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-gradient-to-br from-purple-300/30 to-pink-300/30 rounded-full blur-xl"></div>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center transform animate-pulse border border-white/50">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-200">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
              ¡Perfecto! 🎉
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {selectedService?.requires_deposit 
                ? 'Tu turno ha sido confirmado y el pago procesado exitosamente. Te contactaremos por WhatsApp con todos los detalles.'
                : 'Tu solicitud de turno ha sido enviada exitosamente. Te contactaremos por WhatsApp para confirmar y coordinar la seña.'
              }
            </p>
            
            <div className="mt-8 space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-4 rounded-2xl font-semibold hover:from-pink-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-pink-200/50"
              >
                Solicitar Otro Turno
              </button>
              
              <a 
                href="https://wa.me/5491123456789?text=Hola%20Campi%20Nails%2C%20acabo%20de%20reservar%20un%20turno%20y%20tengo%20una%20consulta" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block text-sm text-pink-600 hover:text-pink-700 transition-colors"
              >
                ¿Tienes alguna pregunta? Contáctanos por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showPendingMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full relative">
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-yellow-300/30 to-orange-300/30 rounded-full blur-xl"></div>
          <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-gradient-to-br from-orange-300/30 to-yellow-300/30 rounded-full blur-xl"></div>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center border border-white/50">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-yellow-200">
              <Clock className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-4">
              ¡Pago en Proceso! ⏳
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Tu turno ha sido reservado y el pago está siendo procesado. Te enviaremos un WhatsApp cuando confirmemos la recepción del pago.
            </p>
            <div className="bg-yellow-50 rounded-2xl p-4 mb-6">
              <p className="text-yellow-800 font-medium">
                Si no completaste el pago, puedes intentarlo nuevamente o contactarnos por WhatsApp.
              </p>
            </div>
            
            <div className="mt-8 space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-4 rounded-2xl font-semibold hover:from-pink-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-pink-200/50"
              >
                Solicitar Otro Turno
              </button>
              
              <a 
                href="https://wa.me/5491123456789?text=Hola%20Campi%20Nails%2C%20tuve%20un%20problema%20con%20mi%20pago" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block text-sm text-pink-600 hover:text-pink-700 transition-colors"
              >
                Contactar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
        {/* Animated background elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-300/30 to-rose-300/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-rose-300/10 to-purple-300/10 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>
        
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-md border-b border-pink-100 sticky top-0 z-10 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 group">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-200/50 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent group-hover:from-rose-600 group-hover:to-pink-600 transition-all duration-300">
                    Campi Nails
                  </h1>
                  <p className="text-gray-600 text-sm">Tu momento de belleza te espera</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">Paso {['service', 'professional', 'datetime', 'details', 'confirmation'].indexOf(currentStep) + 1} de 5</div>
                <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 rounded-full transition-all duration-500 relative bg-size-200 animate-gradient-x"
                       style={{ width: `${getStepProgress()}%` }}>
                    <div className="absolute inset-0 bg-white/20 overflow-hidden">
                      <div className="h-full w-20 bg-white/30 skew-x-30 animate-shimmer"></div>
                    </div>
                  </div>
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
                <div className="text-center relative">
                  <div className="absolute -top-10 -z-10 left-1/2 transform -translate-x-1/2 w-40 h-40 bg-gradient-to-br from-pink-300/20 to-rose-300/20 rounded-full blur-xl"></div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-700 to-rose-700 bg-clip-text text-transparent mb-2">¿Qué servicio te gustaría?</h2>
                  <p className="text-gray-600">Elige el tratamiento perfecto para tus uñas</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className={`relative bg-white rounded-3xl p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                        selectedService?.id === service.id
                          ? 'ring-4 ring-pink-300 shadow-2xl border border-pink-100'
                          : 'shadow-lg hover:shadow-xl border border-white/50'
                      }`}
                      onClick={() => {
                        setSelectedService(service);
                        setValue('service_id', service.id);
                      }}
                    >
                      {selectedService?.id === service.id && (
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                      )}
                      
                      <div className="flex items-start justify-between mb-6 relative">
                        <div className="w-14 h-14 bg-gradient-to-r from-pink-100 to-rose-100 rounded-2xl flex items-center justify-center shadow-md shadow-pink-100">
                          <Scissors className="w-7 h-7 text-pink-600" />
                        </div>
                        <div className="text-right relative">
                          <div className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent shadow-sm">${service.price.toLocaleString()}</div>
                          <div className="text-sm text-gray-500 flex items-center justify-end space-x-1 mt-1">
                            <Clock className="w-3 h-3" />
                            <span>{service.duration_minutes} min</span>
                          </div>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">{service.name}</h3>
                      {service.description && (
                        <p className="text-gray-600 text-sm mb-5">{service.description}</p>
                      )}
                      
                      {service.requires_deposit && (
                        <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-4 border border-pink-100/50 shadow-inner relative overflow-hidden">
                          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-pink-200/20 rounded-full blur-lg"></div>
                          <div className="text-sm text-pink-700 flex items-center justify-between relative">
                            <span className="font-medium flex items-center">
                              <CreditCard className="w-4 h-4 mr-1.5" />
                              Seña requerida:
                            </span>
                            <span className="font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">${Math.round(service.price * service.deposit_percentage / 100).toLocaleString()} ({service.deposit_percentage}%)</span>
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
                    onClick={() => {
                      nextStep();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={!canProceedFromService}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-10 py-4 rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-pink-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-105 flex items-center space-x-3 shadow-lg shadow-pink-200/50"
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
                <div className="text-center relative">
                  <div className="absolute -top-10 -z-10 left-1/2 transform -translate-x-1/2 w-40 h-40 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-xl"></div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent mb-2">¿Tienes alguna preferencia?</h2>
                  <p className="text-gray-600">Puedes elegir tu profesional favorito o dejar que asignemos el mejor disponible</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div
                    className={`bg-white rounded-3xl p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                      selectedEmployee === null
                        ? 'ring-4 ring-pink-300 shadow-2xl border border-pink-100'
                        : 'shadow-lg hover:shadow-xl border border-white/50'
                    }`}
                    onClick={() => setSelectedEmployee(null)}
                  >
                    {selectedEmployee === null && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    )}
                    
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                        <Star className="w-10 h-10 text-purple-600" />
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
                          ? 'ring-4 ring-pink-300 shadow-2xl border border-pink-100'
                          : 'shadow-lg hover:shadow-xl border border-white/50'
                      }`}
                      onClick={() => setSelectedEmployee(employee)}
                    >
                      {selectedEmployee?.id === employee.id && (
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                      )}
                      
                      <div className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-r from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                          <User className="w-10 h-10 text-pink-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{employee.name}</h3>
                        {employee.specialties && employee.specialties.length > 0 && (
                          <div className="flex flex-wrap gap-1 justify-center mt-2">
                            {employee.specialties.map((specialty, index) => (
                              <span key={index} className="px-2 py-1 bg-pink-50 text-pink-600 text-xs rounded-full">
                                {specialty}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      prevStep();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-white border border-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-50 transition-all duration-300 flex items-center space-x-2 shadow-md hover:shadow-lg"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Anterior</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      nextStep();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={!canProceedFromProfessional}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-10 py-4 rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-pink-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-105 flex items-center space-x-3 shadow-lg shadow-pink-200/50"
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
                <div className="text-center relative">
                  <div className="absolute -top-10 -z-10 left-1/2 transform -translate-x-1/2 w-40 h-40 bg-gradient-to-br from-blue-300/20 to-indigo-300/20 rounded-full blur-xl"></div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent mb-2">¿Cuándo te viene mejor?</h2>
                  <p className="text-gray-600">Selecciona tu fecha y horario preferido</p>
                </div>

                <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/50">
                  <div className="flex items-center space-x-2 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center shadow-md">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Elige tu fecha</h3>
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
                  <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/50">
                    <div className="flex items-center space-x-2 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-r from-pink-100 to-rose-100 rounded-xl flex items-center justify-center shadow-md">
                        <Clock className="w-5 h-5 text-pink-600" />
                      </div>
                      <h3 className="text-xl font-semibold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">Horarios disponibles</h3>
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
                    onClick={() => {
                      prevStep();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-white border border-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-50 transition-all duration-300 flex items-center space-x-2 shadow-md hover:shadow-lg"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Anterior</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      nextStep();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={!canProceedFromDateTime}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-10 py-4 rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-pink-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-105 flex items-center space-x-3 shadow-lg shadow-pink-200/50"
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
                <div className="text-center relative">
                  <div className="absolute -top-10 -z-10 left-1/2 transform -translate-x-1/2 w-40 h-40 bg-gradient-to-br from-green-300/20 to-teal-300/20 rounded-full blur-xl"></div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-green-700 to-teal-700 bg-clip-text text-transparent mb-2">Cuéntanos sobre ti</h2>
                  <p className="text-gray-600">Necesitamos algunos datos para confirmar tu turno</p>
                </div>

                <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-lg space-y-6 border border-white/50 relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-green-200/10 to-teal-200/10 rounded-full blur-xl"></div>
                  
                  {/* Recent clients section */}
                  {showRecentClients && recentClients.length > 0 && (
                    <div className="mb-6 pb-6 border-b border-gray-100">
                      <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                        <Heart className="w-4 h-4 text-pink-500 mr-2" />
                        Clientes recientes
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {recentClients.map(client => (
                          <button
                            key={client.id}
                            type="button"
                            onClick={() => {
                              setValue('name', client.name);
                              setValue('whatsapp', client.whatsapp);
                              setValue('email', client.email || '');
                            }}
                            className="flex items-center space-x-2 px-3 py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-xl transition-colors"
                          >
                            <User className="w-4 h-4" />
                            <span className="text-sm">{client.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
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
                    onClick={() => {
                      prevStep();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-white border border-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-50 transition-all duration-300 flex items-center space-x-2 shadow-md hover:shadow-lg"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Anterior</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      nextStep();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={!canProceedFromDetails}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-10 py-4 rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-pink-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-105 flex items-center space-x-3 shadow-lg shadow-pink-200/50"
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
                <div className="text-center relative">
                  <div className="absolute -top-10 -z-10 left-1/2 transform -translate-x-1/2 w-40 h-40 bg-gradient-to-br from-purple-300/20 to-indigo-300/20 rounded-full blur-xl"></div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent mb-2">¡Casi listo! 🎉</h2>
                  <p className="text-gray-600">Revisa los detalles de tu turno antes de confirmar</p>
                </div>

                <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-lg space-y-6 border border-white/50 relative overflow-hidden">
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple-200/10 to-indigo-200/10 rounded-full blur-xl"></div>
                  
                  <div className="border-b border-gray-100 pb-6 relative">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg flex items-center justify-center shadow-sm">
                        <Scissors className="w-4 h-4 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Servicio seleccionado</h3>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-800">{selectedService?.name}</div>
                        <div className="text-sm text-gray-600">{selectedService?.duration_minutes} minutos</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-800">${selectedService?.price.toLocaleString()}</div>
                        {selectedService?.requires_deposit && (
                          <div className="text-sm bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent font-medium">
                            Seña: ${Math.round((selectedService?.price || 0) * (selectedService?.deposit_percentage || 0) / 100).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-b border-gray-100 pb-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center shadow-sm">
                        <Calendar className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Fecha y hora</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-xl border border-blue-100 shadow-sm">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <span>{selectedDate && format(parseISO(selectedDate), 'EEEE, d MMMM yyyy', { locale: es })}</span>
                      </div>
                      <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-xl border border-blue-100 shadow-sm">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <span>{selectedSlot?.start_time || "09:00"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-b border-gray-100 pb-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-100 to-teal-100 rounded-lg flex items-center justify-center shadow-sm">
                        <User className="w-4 h-4 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">Profesional</h3>
                    </div>
                    <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-xl inline-block border border-green-100 shadow-sm">
                      <User className="w-5 h-5 text-green-600" />
                      <span>{selectedEmployee?.name || selectedSlot?.employee?.name || 'Cualquier profesional disponible'}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-pink-100 to-rose-100 rounded-lg flex items-center justify-center shadow-sm">
                        <User className="w-4 h-4 text-pink-600" />
                      </div>
                      <h3 className="text-lg font-semibold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">Tus datos</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 bg-pink-50 px-3 py-2 rounded-xl inline-block border border-pink-100 shadow-sm">
                        <User className="w-4 h-4 text-pink-600" />
                        <span>{watch('name')}</span>
                      </div>
                      <div className="flex items-center space-x-2 bg-pink-50 px-3 py-2 rounded-xl inline-block border border-pink-100 shadow-sm">
                        <Phone className="w-4 h-4 text-pink-600" />
                        <span>{watch('whatsapp')}</span>
                      </div>
                      {watch('email') && (
                        <div className="flex items-center space-x-2 bg-pink-50 px-3 py-2 rounded-xl inline-block border border-pink-100 shadow-sm">
                          <Mail className="w-4 h-4 text-pink-600" />
                          <span>{watch('email')}</span>
                        </div>
                      )}
                      {watch('special_requests') && (
                        <div className="flex items-start space-x-2 bg-pink-50 px-3 py-2 rounded-xl border border-pink-100 shadow-sm">
                          <MessageSquare className="w-4 h-4 text-pink-600 mt-0.5" />
                          <span className="text-sm">{watch('special_requests')}</span>
                        </div>
                      )}
                      
                      {referencePhotoPreview && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-pink-700 mb-2 flex items-center">
                            <Image className="w-4 h-4 text-pink-600 mr-2" />
                            Foto de referencia:
                          </p>
                          <img 
                            src={referencePhotoPreview} 
                            alt="Referencia" 
                            className="w-full h-48 object-contain border border-pink-100 rounded-xl shadow-md"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Reference Photo Upload */}
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-lg flex items-center justify-center shadow-sm">
                        <Image className="w-4 h-4 text-amber-600" />
                      </div>
                      <h3 className="text-lg font-semibold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">Foto de referencia (opcional)</h3>
                    </div>
                    
                    {referencePhotoPreview ? (
                      <div className="relative mb-3">
                        <img 
                          src={referencePhotoPreview} 
                          alt="Referencia" 
                          className="w-full h-48 object-contain border border-amber-100 rounded-xl shadow-md"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setReferencePhoto(null);
                            setReferencePhotoPreview(null);
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div 
                        className="border-2 border-dashed border-amber-200 rounded-xl p-6 text-center cursor-pointer hover:bg-amber-50 transition-colors"
                        onClick={() => document.getElementById('photo-upload')?.click()}
                      >
                        <Camera className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                        <p className="text-sm text-amber-700">Haz clic para subir una foto de referencia</p>
                        <p className="text-xs text-amber-500 mt-1">Formatos: JPG, PNG</p>
                      </div>
                    )}
                    
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-6 border border-blue-100 shadow-inner relative overflow-hidden">
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-blue-200/10 to-indigo-200/10 rounded-full blur-xl"></div>
                  
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-sm">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-semibold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">Información importante</h3>
                  </div>
                  
                  <ul className="text-sm text-blue-700 space-y-2 relative">
                    <li className="flex items-start">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-2 mt-0.5">
                        <span className="text-blue-600 text-xs">1</span>
                      </div>
                      Te contactaremos por WhatsApp para confirmar tu turno
                    </li>
                    {selectedService?.requires_deposit && (
                      <li className="flex items-start">
                        <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-2 mt-0.5">
                          <span className="text-blue-600 text-xs">2</span>
                        </div>
                        Deberás abonar la seña para asegurar tu reserva
                      </li>
                    )}
                    <li className="flex items-start">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-2 mt-0.5">
                        <span className="text-blue-600 text-xs">3</span>
                      </div>
                      Puedes reprogramar hasta 2 veces sin costo adicional
                    </li>
                    <li className="flex items-start">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-2 mt-0.5">
                        <span className="text-blue-600 text-xs">4</span>
                      </div>
                      Cancelaciones con menos de 24hs de anticipación pierden la seña
                    </li>
                  </ul>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 animate-pulse">
                    <p className="text-red-600 text-sm flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{error}</span>
                    </p>
                  </div>
                )}

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      prevStep();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-white border border-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-50 transition-all duration-300 flex items-center space-x-2 shadow-md hover:shadow-lg"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Anterior</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-10 py-4 rounded-2xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-200/50"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>Procesando...</span>
                      </>
                    ) : paymentRequired ? (
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