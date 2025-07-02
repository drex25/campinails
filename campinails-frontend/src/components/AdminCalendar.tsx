import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { timeSlotService, serviceService } from '../services/api';
import type { TimeSlot, Service } from '../types';

interface AdminCalendarProps {
  onSlotClick?: (slot: TimeSlot) => void;
}

export const AdminCalendar: React.FC<AdminCalendarProps> = ({ onSlotClick }) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'reserved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'blocked': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header del Calendario */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">Calendario de Turnos</h2>
            
            {/* Selector de Servicio */}
            <select
              value={selectedService || ''}
              onChange={(e) => setSelectedService(Number(e.target.value))}
              className="input-field w-64"
            >
              {services.map(service => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
              className="btn-secondary px-3 py-1"
            >
              ←
            </button>
            
            <span className="text-sm font-medium text-gray-700">
              {format(startOfWeek(currentWeek, { weekStartsOn: 1 }), 'dd MMM', { locale: es })} - 
              {format(endOfWeek(currentWeek, { weekStartsOn: 1 }), 'dd MMM yyyy', { locale: es })}
            </span>
            
            <button
              onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
              className="btn-secondary px-3 py-1"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Calendario */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="p-3 text-left text-sm font-medium text-gray-500 w-20">Hora</th>
              {getWeekDays().map(day => (
                <th key={day.toISOString()} className="p-3 text-center text-sm font-medium text-gray-500 min-w-32">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400">
                      {format(day, 'EEE', { locale: es })}
                    </span>
                    <span className="text-sm">
                      {format(day, 'dd')}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {workHours.map(time => (
              <tr key={time} className="border-b border-gray-100">
                <td className="p-3 text-sm text-gray-500 font-medium">
                  {time}
                </td>
                {getWeekDays().map(day => {
                  const slot = getSlotForTimeAndDate(time, day);
                  return (
                    <td key={`${time}-${day.toISOString()}`} className="p-1">
                      {slot ? (
                        <button
                          onClick={() => onSlotClick?.(slot)}
                          className={`w-full p-2 text-xs rounded border ${getSlotStatusColor(slot.status)} hover:opacity-80 transition-opacity`}
                        >
                          <div className="font-medium">{slot.status === 'reserved' ? 'Reservado' : slot.status}</div>
                          {slot.appointment && (
                            <div className="text-xs opacity-75">
                              {slot.appointment.client?.name}
                            </div>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => onSlotClick?.(null)}
                          className="w-full p-2 text-xs text-gray-400 border border-dashed border-gray-300 rounded hover:border-gray-400 hover:text-gray-600 transition-colors"
                        >
                          +
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

      {/* Leyenda */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
            <span>Disponible</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
            <span>Reservado</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
            <span>Bloqueado</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
            <span>Cancelado</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente Modal para crear slots en masa
interface CreateSlotsModalProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
  service?: Service;
}

const CreateSlotsModal: React.FC<CreateSlotsModalProps> = ({ onClose, onSubmit, service }) => {
  const [formData, setFormData] = useState({
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(new Date(), 'yyyy-MM-dd'),
    start_time: '09:00',
    end_time: '18:00',
    duration_minutes: service?.duration_minutes || 30,
    days_of_week: [1, 2, 3, 4, 5, 6]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Crear Slots en Masa</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha Inicio</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha Fin</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Hora Inicio</label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Hora Fin</label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Duración (minutos)</label>
            <input
              type="number"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({...formData, duration_minutes: Number(e.target.value)})}
              className="input-field"
              min="15"
              max="480"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              Crear Slots
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 