import React, { useState, useEffect } from 'react';
import { employeeService } from '../../services/api';
import type { Employee, Service } from '../../types';
import { Calendar, Clock, User, Plus, Save, X, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../ui/Toast';
import { Modal } from '../ui/Modal';

interface EmployeeSchedule {
  id: number;
  employee_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  notes?: string;
}

export const EmployeeScheduleSection: React.FC<{ employeeId?: number | null }> = ({ employeeId }) => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [schedules, setSchedules] = useState<EmployeeSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<EmployeeSchedule | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const { toasts, removeToast, success, error } = useToast();

  useEffect(() => {
    if (employeeId) {
      setSelectedEmployeeId(employeeId);
    }
    loadEmployees();
  }, [employeeId]);

  useEffect(() => {
    if (selectedEmployeeId) {
      loadEmployeeDetails();
    }
  }, [selectedEmployeeId]);

  const loadEmployees = async () => {
    try {
      const data = await employeeService.getAll({ active: true });
      setEmployees(data);
      if (data.length > 0 && !selectedEmployeeId && !employeeId) {
        setSelectedEmployeeId(data[0].id);
      }
    } catch (err) {
      console.error('Error loading employees:', err);
      error('Error', 'No se pudieron cargar los empleados');
    }
  };

  const loadEmployeeDetails = async () => {
    if (!selectedEmployeeId) return;
    
    setIsLoading(true);
    try {
      const employeeData = await employeeService.getById(selectedEmployeeId);
      setEmployee(employeeData);
      
      // Aquí deberíamos cargar los horarios del empleado desde la API
      // Por ahora, usamos datos de ejemplo
      const mockSchedules: EmployeeSchedule[] = [
        {
          id: 1,
          employee_id: selectedEmployeeId,
          day_of_week: 1, // Lunes
          start_time: '09:00',
          end_time: '18:00',
          is_active: true,
        },
        {
          id: 2,
          employee_id: selectedEmployeeId,
          day_of_week: 2, // Martes
          start_time: '09:00',
          end_time: '18:00',
          is_active: true,
        },
        {
          id: 3,
          employee_id: selectedEmployeeId,
          day_of_week: 3, // Miércoles
          start_time: '09:00',
          end_time: '18:00',
          is_active: true,
        },
        {
          id: 4,
          employee_id: selectedEmployeeId,
          day_of_week: 4, // Jueves
          start_time: '09:00',
          end_time: '18:00',
          is_active: true,
        },
        {
          id: 5,
          employee_id: selectedEmployeeId,
          day_of_week: 5, // Viernes
          start_time: '09:00',
          end_time: '18:00',
          is_active: true,
        },
        {
          id: 6,
          employee_id: selectedEmployeeId,
          day_of_week: 6, // Sábado
          start_time: '09:00',
          end_time: '14:00',
          is_active: true,
          notes: 'Medio día los sábados',
        },
      ];
      
      setSchedules(mockSchedules);
    } catch (err) {
      console.error('Error loading employee details:', err);
      error('Error', 'No se pudieron cargar los detalles del empleado');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (schedule: EmployeeSchedule) => {
    setEditingSchedule(schedule);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás segura de que quieres eliminar este horario?')) {
      try {
        // Aquí deberíamos llamar a la API para eliminar el horario
        // Por ahora, simulamos la eliminación
        setSchedules(schedules.filter(s => s.id !== id));
        success('Horario eliminado', 'El horario se eliminó correctamente');
      } catch (err) {
        console.error('Error deleting schedule:', err);
        error('Error', 'No se pudo eliminar el horario');
      }
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingSchedule) {
        // Aquí deberíamos llamar a la API para actualizar el horario
        // Por ahora, simulamos la actualización
        setSchedules(schedules.map(s => 
          s.id === editingSchedule.id ? { ...s, ...data } : s
        ));
        success('Horario actualizado', 'El horario se actualizó correctamente');
      } else {
        // Aquí deberíamos llamar a la API para crear el horario
        // Por ahora, simulamos la creación
        const newSchedule: EmployeeSchedule = {
          id: Math.max(0, ...schedules.map(s => s.id)) + 1,
          employee_id: selectedEmployeeId!,
          ...data,
        };
        setSchedules([...schedules, newSchedule]);
        success('Horario creado', 'El horario se creó correctamente');
      }
      setShowForm(false);
      setEditingSchedule(null);
    } catch (err) {
      console.error('Error saving schedule:', err);
      error('Error', 'No se pudo guardar el horario');
    }
  };

  const getDayName = (dayOfWeek: number): string => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[dayOfWeek];
  };

  if (isLoading && !employee) {
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
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Horarios de Empleados</h2>
                <p className="text-gray-600">Gestiona los días y horarios de trabajo</p>
              </div>
            </div>

            <button 
              onClick={() => {
                setEditingSchedule(null);
                setShowForm(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Horario</span>
            </button>
          </div>

          {/* Employee Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecciona un empleado
            </label>
            <select
              value={selectedEmployeeId || ''}
              onChange={(e) => setSelectedEmployeeId(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 transition-all duration-300"
            >
              <option value="">Selecciona un empleado</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Employee Details */}
        {employee && (
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{employee.name}</h3>
                <p className="text-gray-600">{employee.email}</p>
              </div>
              <div className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${
                employee.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {employee.is_active ? 'Activo' : 'Inactivo'}
              </div>
            </div>

            {/* Services */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Servicios que ofrece</h4>
              <div className="flex flex-wrap gap-2">
                {employee.services && employee.services.length > 0 ? (
                  employee.services.map(service => (
                    <span
                      key={service.id}
                      className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full"
                    >
                      {service.name}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No hay servicios asignados</p>
                )}
              </div>
            </div>

            {/* Schedule Table */}
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Horarios de trabajo</h4>
            {schedules.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Día</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Horario</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Estado</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Notas</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map(schedule => (
                      <tr key={schedule.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">
                          {getDayName(schedule.day_of_week)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {schedule.start_time} - {schedule.end_time}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            schedule.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {schedule.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {schedule.notes || '-'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleEdit(schedule)}
                              className="p-1 text-blue-600 hover:text-blue-800 transition-colors duration-200"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(schedule.id)}
                              className="p-1 text-red-600 hover:text-red-800 transition-colors duration-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-2xl">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 mb-2">No hay horarios configurados</p>
                <button
                  onClick={() => {
                    setEditingSchedule(null);
                    setShowForm(true);
                  }}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors duration-200 text-sm font-medium"
                >
                  Configurar horarios
                </button>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!employee && !isLoading && (
          <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Selecciona un empleado
            </h3>
            <p className="text-gray-600 mb-6">
              Elige un empleado para ver y configurar sus horarios de trabajo
            </p>
          </div>
        )}
      </div>

      {/* Schedule Form Modal */}
      <ScheduleFormModal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingSchedule(null);
        }}
        onSubmit={handleFormSubmit}
        schedule={editingSchedule}
        employeeId={selectedEmployeeId}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
};

interface ScheduleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  schedule: EmployeeSchedule | null;
  employeeId: number | null;
}

const ScheduleFormModal: React.FC<ScheduleFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  schedule,
  employeeId,
}) => {
  const [formData, setFormData] = useState({
    day_of_week: 1,
    start_time: '09:00',
    end_time: '18:00',
    is_active: true,
    notes: '',
  });

  useEffect(() => {
    if (schedule) {
      setFormData({
        day_of_week: schedule.day_of_week,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        is_active: schedule.is_active,
        notes: schedule.notes || '',
      });
    } else {
      setFormData({
        day_of_week: 1,
        start_time: '09:00',
        end_time: '18:00',
        is_active: true,
        notes: '',
      });
    }
  }, [schedule]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) return;
    
    onSubmit({
      ...formData,
      employee_id: employeeId,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={schedule ? 'Editar Horario' : 'Nuevo Horario'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Día de la semana
            </label>
            <select
              name="day_of_week"
              value={formData.day_of_week}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 transition-all duration-300"
            >
              <option value={1}>Lunes</option>
              <option value={2}>Martes</option>
              <option value={3}>Miércoles</option>
              <option value={4}>Jueves</option>
              <option value={5}>Viernes</option>
              <option value={6}>Sábado</option>
              <option value={0}>Domingo</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4" />
                <span>Hora de inicio</span>
              </label>
              <input
                name="start_time"
                type="time"
                value={formData.start_time}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 transition-all duration-300"
              />
            </div>
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4" />
                <span>Hora de fin</span>
              </label>
              <input
                name="end_time"
                type="time"
                value={formData.end_time}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 transition-all duration-300"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input
              name="is_active"
              type="checkbox"
              checked={formData.is_active}
              onChange={handleChange}
              className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label className="text-sm font-medium text-gray-700">
              Horario activo
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas (opcional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 transition-all duration-300 resize-none"
              placeholder="Notas adicionales..."
            />
          </div>
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
            disabled={!employeeId}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{schedule ? 'Actualizar' : 'Crear'} Horario</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};