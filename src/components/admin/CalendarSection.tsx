import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isSameDay, parseISO, addMonths, subMonths, startOfMonth, endOfMonth, eachWeekOfInterval, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { timeSlotService, serviceService, employeeService } from '../../services/api';
import type { TimeSlot, Service, Employee } from '../../types';
import { Calendar, ChevronLeft, ChevronRight, Plus, Filter, Search, Grid, List, User, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { CalendarSlotForm } from '../forms/CalendarSlotForm';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../ui/Toast';

export const CalendarSection: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSlotForm, setShowSlotForm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
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
    if (selectedService || selectedEmployee) {
      loadTimeSlots();
    }
  }, [selectedService, selectedEmployee, currentDate, viewMode]);

  const loadServices = async () => {
    try {
      const servicesData = await serviceService.getAll();
      setServices(servicesData);
      if (servicesData.length > 0 && !selectedService) {
        setSelectedService(servicesData[0].id);
      }
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

  const loadTimeSlots = async () => {
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
        start_date: startDate,
        end_date: endDate
      };
      
      if (selectedService) {
        params.service_id = selectedService;
      }
      
      if (selectedEmployee) {
        params.employee_id = selectedEmployee;
      }
      
      const slots = await timeSlotService.getAll(params);
      setTimeSlots(slots);
    } catch (err) {
      console.error('Error cargando slots:', err);
      error('Error', 'No se pudieron cargar los horarios');
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

  const getSlotForTimeAndDate = (time: string, date: Date) => {
    return timeSlots.find(slot => 
      slot.start_time === time && 
      isSameDay(parseISO(slot.date), date)
    );
  };

  const getSlotStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
      case 'reserved': return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200';
      case 'blocked': return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200';
    }
  };

  const handleSlotClick = (slot: TimeSlot | null, date?: Date, time?: string) => {
    if (slot) {
      setSelectedSlot(slot);
      setSelectedDate(null);
      setSelectedTime(null);
    } else if (date && time) {
      setSelectedSlot(null);
      setSelectedDate(format(date, 'yyyy-MM-dd'));
      setSelectedTime(time);
    }
    setShowSlotForm(true);
  };

  const handleFormSuccess = () => {
    loadTimeSlots();
    setShowSlotForm(false);
    setSelectedSlot(null);
    setSelectedDate(null);
    setSelectedTime(null);
    success('Horario guardado', 'El horario se guardó correctamente');
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
                  const slot = getSlotForTimeAndDate(time, day);
                  return (
                    <td key={`${time}-${day.toISOString()}`} className="p-2">
                      {slot ? (
                        <button
                          onClick={() => handleSlotClick(slot)}
                          className={`w-full p-3 text-xs rounded-2xl border transition-all duration-200 transform hover:scale-105 ${getSlotStatusColor(slot.status)}`}
                        >
                          <div className="font-semibold capitalize">
                            {slot.status === 'reserved' ? 'Reservado' : 
                             slot.status === 'available' ? 'Disponible' :
                             slot.status === 'blocked' ? 'Bloqueado' : 'Cancelado'}
                          </div>
                          {slot.appointment && (
                            <div className="text-xs opacity-75 mt-1 truncate">
                              {slot.appointment.client?.name}
                            </div>
                          )}
                          {slot.employee && (
                            <div className="text-xs opacity-60 mt-1 truncate">
                              {slot.employee.name}
                            </div>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSlotClick(null, day, time)}
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
                  
                  // Obtener todos los slots para este día
                  const daySlots = timeSlots.filter(slot => 
                    isSameDay(parseISO(slot.date), day)
                  );
                  
                  // Contar slots por estado
                  const availableCount = daySlots.filter(slot => slot.status === 'available').length;
                  const reservedCount = daySlots.filter(slot => slot.status === 'reserved').length;
                  const blockedCount = daySlots.filter(slot => slot.status === 'blocked').length;
                  
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
                          {availableCount > 0 && (
                            <div className="flex items-center space-x-1 text-xs">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              <span className="text-gray-600">{availableCount} disponibles</span>
                            </div>
                          )}
                          
                          {reservedCount > 0 && (
                            <div className="flex items-center space-x-1 text-xs">
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                              <span className="text-gray-600">{reservedCount} reservados</span>
                            </div>
                          )}
                          
                          {blockedCount > 0 && (
                            <div className="flex items-center space-x-1 text-xs">
                              <div className="w-2 h-2 rounded-full bg-red-500"></div>
                              <span className="text-gray-600">{blockedCount} bloqueados</span>
                            </div>
                          )}
                          
                          {daySlots.length === 0 && isCurrentMonth && (
                            <button
                              onClick={() => handleSlotClick(null, day, '09:00')}
                              className="w-full mt-2 p-1 text-xs text-gray-400 border border-dashed border-gray-200 rounded-lg hover:border-gray-300 hover:text-gray-600 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center space-x-1"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Agregar</span>
                            </button>
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

  if (isLoading && timeSlots.length === 0) {
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
                <p className="text-gray-600">Gestiona los horarios disponibles</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setShowSlotForm(true)}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Slots</span>
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
              <span className="text-sm text-gray-600">Disponible</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
              <span className="text-sm text-gray-600">Reservado</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
              <span className="text-sm text-gray-600">Bloqueado</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
              <span className="text-sm text-gray-600">Cancelado</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-dashed border-gray-300 rounded"></div>
              <span className="text-sm text-gray-600">Sin slot creado</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Slot Form */}
      <CalendarSlotForm
        isOpen={showSlotForm}
        onClose={() => setShowSlotForm(false)}
        onSuccess={handleFormSuccess}
        slot={selectedSlot}
        date={selectedDate}
        time={selectedTime}
        services={services}
        employees={employees}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
};