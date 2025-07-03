import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isSameDay, parseISO, addMonths, subMonths, startOfMonth, endOfMonth, eachWeekOfInterval, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { appointmentService, serviceService, employeeService } from '../../services/api';
import type { Appointment, Service, Employee } from '../../types';
import { Calendar, ChevronLeft, ChevronRight, Plus, Filter, Search, Grid, List, User, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { AppointmentForm } from '../forms/AppointmentForm';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../ui/Toast';

export const CalendarSection: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const { toasts, removeToast, success, error } = useToast();

  // Horarios de trabajo
  const workHours = Array.from({ length: 18 }, (_, i) => {
    const hour = Math.floor(i / 2) + 9; // 9:00 a 18:00
    const minute = (i % 2) * 30;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });

  useEffect(() => {
    loadServices();
    loadEmployees();
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [selectedService, selectedEmployee, currentDate, viewMode]);

  const loadServices = async () => {
    try {
      const servicesData = await serviceService.getAll();
      setServices(servicesData);
    } catch (err) {
      console.error('Error cargando servicios:', err);
      error('Error', 'No se pudieron cargar los servicios');
    }
  };

  const loadEmployees = async () => {
    try {
      const employeesData = await employeeService.getAll({ active: true });
      setEmployees(employeesData);
    } catch (err) {
      console.error('Error cargando empleados:', err);
      error('Error', 'No se pudieron cargar los empleados');
    }
  };

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      let startDate, endDate;
      
      if (viewMode === 'week') {
        startDate = format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        endDate = format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      } else {
        startDate = format(startOfMonth(currentDate), 'yyyy-MM-dd');
        endDate = format(endOfMonth(currentDate), 'yyyy-MM-dd');
      }
      
      const params: any = {
        date: startDate + ',' + endDate
      };
      
      if (selectedService) {
        params.service_id = selectedService;
      }
      
      if (selectedEmployee) {
        params.employee_id = selectedEmployee;
      }
      
      const appointmentsData = await appointmentService.getAll(params);
      setAppointments(appointmentsData);
    } catch (err) {
      console.error('Error cargando citas:', err);
      error('Error', 'No se pudieron cargar las citas');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    if (viewMode === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getWeekDays = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Lunes
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  };

  const getMonthDays = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    
    // Obtener todas las semanas del mes
    const weeks = eachWeekOfInterval(
      { start, end },
      { weekStartsOn: 1 }
    );
    
    // Para cada semana, obtener los días
    return weeks.map(week => {
      const weekStart = startOfWeek(week, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(week, { weekStartsOn: 1 });
      return eachDayOfInterval({ start: weekStart, end: weekEnd });
    });
  };

  const getAppointmentsForTimeAndDate = (time: string, date: Date) => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.scheduled_at);
      const appointmentTime = format(appointmentDate, 'HH:mm');
      return appointmentTime === time && isSameDay(appointmentDate, date);
    });
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.scheduled_at);
      return isSameDay(appointmentDate, date);
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
      case 'pending_deposit': return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200';
      case 'no_show': return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200';
      case 'rescheduled': return 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'pending_deposit': return 'Pendiente';
      case 'completed': return 'Completado';
      case 'cancelled': return 'Cancelado';
      case 'no_show': return 'No asistió';
      case 'rescheduled': return 'Reprogramado';
      default: return status;
    }
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setSelectedDate(null);
    setSelectedTime(null);
    setShowAppointmentForm(true);
  };

  const handleNewAppointment = (date?: Date, time?: string) => {
    setSelectedAppointment(null);
    if (date && time) {
      setSelectedDate(format(date, 'yyyy-MM-dd'));
      setSelectedTime(time);
    } else {
      setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
      setSelectedTime('09:00');
    }
    setShowAppointmentForm(true);
  };

  const handleFormSuccess = () => {
    loadAppointments();
    setShowAppointmentForm(false);
    setSelectedAppointment(null);
    setSelectedDate(null);
    setSelectedTime(null);
    success('Turno guardado', 'El turno se guardó correctamente');
  };

  const renderWeekView = () => {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left text-sm font-semibold text-gray-600 w-24">Hora</th>
              {getWeekDays().map(day => (
                <th key={day.toISOString()} className="p-4 text-center text-sm font-semibold text-gray-600 min-w-32">
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-400 uppercase">
                      {format(day, 'EEE', { locale: es })}
                    </span>
                    <span className="text-lg font-bold text-gray-800 mt-1">
                      {format(day, 'dd')}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {workHours.map(time => (
              <tr key={time} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4 text-sm text-gray-600 font-medium bg-gray-50">
                  {time}
                </td>
                {getWeekDays().map(day => {
                  const appointmentsAtTime = getAppointmentsForTimeAndDate(time, day);
                  return (
                    <td key={`${time}-${day.toISOString()}`} className="p-2">
                      {appointmentsAtTime.length > 0 ? (
                        <div className="space-y-1">
                          {appointmentsAtTime.map(appointment => (
                            <button
                              key={appointment.id}
                              onClick={() => handleAppointmentClick(appointment)}
                              className={`w-full p-3 text-xs rounded-2xl border transition-all duration-200 transform hover:scale-105 ${getStatusColor(appointment.status)}`}
                            >
                              <div className="font-semibold capitalize">
                                {getStatusText(appointment.status)}
                              </div>
                              {appointment.client && (
                                <div className="text-xs opacity-75 mt-1 truncate">
                                  {appointment.client.name}
                                </div>
                              )}
                              {appointment.service && (
                                <div className="text-xs opacity-60 mt-1 truncate">
                                  {appointment.service.name}
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleNewAppointment(day, time)}
                          className="w-full p-3 text-xs text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl hover:border-gray-300 hover:text-gray-600 hover:bg-gray-50 transition-all duration-200 group"
                        >
                          <Plus className="w-4 h-4 mx-auto group-hover:scale-110 transition-transform duration-200" />
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderMonthView = () => {
    const monthDays = getMonthDays();
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, index) => (
                <th key={index} className="p-4 text-center text-sm font-semibold text-gray-600">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {monthDays.map((week, weekIndex) => (
              <tr key={weekIndex} className="border-b border-gray-100">
                {week.map(day => {
                  const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                  const isToday = isSameDay(day, new Date());
                  
                  // Obtener todos los turnos para este día
                  const dayAppointments = getAppointmentsForDate(day);
                  
                  // Contar turnos por estado
                  const confirmedCount = dayAppointments.filter(apt => apt.status === 'confirmed').length;
                  const pendingCount = dayAppointments.filter(apt => apt.status === 'pending_deposit').length;
                  const cancelledCount = dayAppointments.filter(apt => apt.status === 'cancelled' || apt.status === 'no_show').length;
                  
                  return (
                    <td 
                      key={day.toISOString()} 
                      className={`p-1 align-top ${isCurrentMonth ? '' : 'bg-gray-50 opacity-50'}`}
                      style={{ height: '120px' }}
                    >
                      <div className="h-full rounded-xl border border-gray-100 hover:border-gray-300 transition-all duration-200 p-2">
                        <div className={`text-right mb-2 ${isToday ? 'font-bold text-pink-600' : 'text-gray-700'}`}>
                          {format(day, 'd')}
                        </div>
                        
                        <div className="space-y-1">
                          {confirmedCount > 0 && (
                            <div className="flex items-center space-x-1 text-xs">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              <span className="text-gray-600">{confirmedCount} confirmados</span>
                            </div>
                          )}
                          
                          {pendingCount > 0 && (
                            <div className="flex items-center space-x-1 text-xs">
                              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                              <span className="text-gray-600">{pendingCount} pendientes</span>
                            </div>
                          )}
                          
                          {cancelledCount > 0 && (
                            <div className="flex items-center space-x-1 text-xs">
                              <div className="w-2 h-2 rounded-full bg-red-500"></div>
                              <span className="text-gray-600">{cancelledCount} cancelados</span>
                            </div>
                          )}
                          
                          {dayAppointments.length === 0 && isCurrentMonth && (
                            <button
                              onClick={() => handleNewAppointment(day, '09:00')}
                              className="w-full mt-2 p-1 text-xs text-gray-400 border border-dashed border-gray-200 rounded-lg hover:border-gray-300 hover:text-gray-600 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center space-x-1"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Nuevo turno</span>
                            </button>
                          )}
                          
                          {dayAppointments.length > 0 && (
                            <div className="mt-2">
                              {dayAppointments.slice(0, 2).map(appointment => (
                                <button
                                  key={appointment.id}
                                  onClick={() => handleAppointmentClick(appointment)}
                                  className={`w-full mb-1 p-1 text-xs rounded-lg ${getStatusColor(appointment.status)} truncate`}
                                >
                                  {format(new Date(appointment.scheduled_at), 'HH:mm')} - {appointment.client?.name.split(' ')[0]}
                                </button>
                              ))}
                              {dayAppointments.length > 2 && (
                                <div className="text-xs text-center text-gray-500">
                                  +{dayAppointments.length - 2} más
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (isLoading && appointments.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Calendario de Turnos</h2>
                <p className="text-gray-600">Gestiona los turnos y citas</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button 
                onClick={() => handleNewAppointment()}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Turno</span>
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-6">
            <div className="flex items-center space-x-4">
              {/* Service Selector */}
              <select
                value={selectedService || ''}
                onChange={(e) => setSelectedService(e.target.value ? Number(e.target.value) : null)}
                className="px-4 py-2 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all duration-300"
              >
                <option value="">Todos los servicios</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>

              {/* Employee Selector */}
              <select
                value={selectedEmployee || ''}
                onChange={(e) => setSelectedEmployee(e.target.value ? Number(e.target.value) : null)}
                className="px-4 py-2 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all duration-300"
              >
                <option value="">Todos los empleados</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>

              {/* View Mode */}
              <div className="flex items-center bg-gray-100 rounded-2xl p-1">
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    viewMode === 'week'
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <List className="w-4 h-4" />
                  <span>Semana</span>
                </button>
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    viewMode === 'month'
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                  <span>Mes</span>
                </button>
              </div>
            </div>

            {/* Date Navigation */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePrevious}
                className="p-2 rounded-2xl border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              
              <button
                onClick={handleToday}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
              >
                Hoy
              </button>
              
              <div className="text-center min-w-48">
                <div className="text-lg font-semibold text-gray-800">
                  {viewMode === 'week' ? (
                    <>
                      {format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'dd MMM', { locale: es })} - 
                      {format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'dd MMM yyyy', { locale: es })}
                    </>
                  ) : (
                    format(currentDate, 'MMMM yyyy', { locale: es })
                  )}
                </div>
              </div>
              
              <button
                onClick={handleNext}
                className="p-2 rounded-2xl border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          {viewMode === 'week' ? renderWeekView() : renderMonthView()}
        </div>

        {/* Legend */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Leyenda</h3>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
              <span className="text-sm text-gray-600">Confirmado</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></div>
              <span className="text-sm text-gray-600">Pendiente</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
              <span className="text-sm text-gray-600">Completado</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
              <span className="text-sm text-gray-600">Cancelado</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-purple-100 border border-purple-200 rounded"></div>
              <span className="text-sm text-gray-600">Reprogramado</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-dashed border-gray-300 rounded"></div>
              <span className="text-sm text-gray-600">Disponible</span>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Form */}
      <AppointmentForm
        isOpen={showAppointmentForm}
        onClose={() => setShowAppointmentForm(false)}
        onSuccess={handleFormSuccess}
        appointment={selectedAppointment}
        initialDate={selectedDate}
        initialTime={selectedTime}
        services={services}
        employees={employees}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
};