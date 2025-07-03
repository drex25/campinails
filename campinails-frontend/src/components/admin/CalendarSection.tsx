import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { timeSlotService, serviceService } from '../../services/api';
import type { TimeSlot, Service } from '../../types';
import { Calendar, ChevronLeft, ChevronRight, Plus, Filter, Search } from 'lucide-react';

export const CalendarSection: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');

  // Horarios de trabajo
  const workHours = Array.from({ length: 18 }, (_, i) => {
    const hour = Math.floor(i / 2) + 9; // 9:00 a 18:00
    const minute = (i % 2) * 30;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    if (selectedService) {
      loadTimeSlots();
    }
  }, [selectedService, currentWeek]);

  const loadServices = async () => {
    try {
      const servicesData = await serviceService.getAll();
      setServices(servicesData);
      if (servicesData.length > 0) {
        setSelectedService(servicesData[0].id);
      }
    } catch (error) {
      console.error('Error cargando servicios:', error);
    }
  };

  const loadTimeSlots = async () => {
    if (!selectedService) return;
    
    setIsLoading(true);
    try {
      const startDate = format(startOfWeek(currentWeek), 'yyyy-MM-dd');
      const endDate = format(endOfWeek(currentWeek), 'yyyy-MM-dd');
      
      const slots = await timeSlotService.getByDateRange(selectedService, startDate, endDate);
      setTimeSlots(slots);
    } catch (error) {
      console.error('Error cargando slots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getWeekDays = () => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Lunes
    const end = endOfWeek(currentWeek, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
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

  const handleSlotClick = (slot: TimeSlot | null) => {
    // Aquí puedes abrir un modal o drawer para editar el slot
    console.log('Slot clicked:', slot);
  };

  return (
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
            <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Crear Slots</span>
            </button>
            
            <button className="p-2 rounded-2xl border border-gray-200 hover:bg-gray-50 transition-colors duration-200">
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Service Selector */}
            <select
              value={selectedService || ''}
              onChange={(e) => setSelectedService(Number(e.target.value))}
              className="px-4 py-2 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all duration-300"
            >
              {services.map(service => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>

            {/* View Mode */}
            <div className="flex items-center bg-gray-100 rounded-2xl p-1">
              <button
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  viewMode === 'week'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  viewMode === 'day'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Día
              </button>
            </div>
          </div>

          {/* Week Navigation */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
              className="p-2 rounded-2xl border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="text-center min-w-48">
              <div className="text-lg font-semibold text-gray-800">
                {format(startOfWeek(currentWeek, { weekStartsOn: 1 }), 'dd MMM', { locale: es })} - 
                {format(endOfWeek(currentWeek, { weekStartsOn: 1 }), 'dd MMM yyyy', { locale: es })}
              </div>
              <div className="text-sm text-gray-500">
                {format(currentWeek, 'MMMM yyyy', { locale: es })}
              </div>
            </div>
            
            <button
              onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
              className="p-2 rounded-2xl border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando calendario...</p>
          </div>
        ) : (
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
                              onClick={() => handleSlotClick(null)}
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
        )}
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
  );
};