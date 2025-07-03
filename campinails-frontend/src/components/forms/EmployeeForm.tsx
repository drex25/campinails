import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { employeeService, serviceService } from '../../services/api';
import type { Employee, Service } from '../../types';
import { Modal } from '../ui/Modal';
import { UserCheck, Mail, Phone, Star, Save, X } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

const schema = yup.object({
  name: yup.string().required('Nombre es requerido'),
  email: yup.string().email('Email inválido').required('Email es requerido'),
  phone: yup.string().optional(),
  is_active: yup.boolean(),
  specialties: yup.array().of(yup.string()),
  notes: yup.string().optional(),
  service_ids: yup.array().of(yup.number()),
});

interface EmployeeFormProps {
  isOpen: boolean;
  onClose: () => void;
  employee?: Employee | null;
  onSuccess: () => void;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  isOpen,
  onClose,
  employee,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [specialtyInput, setSpecialtyInput] = useState('');
  const { success, error } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      is_active: true,
      specialties: [],
      notes: '',
      service_ids: [],
    },
  });

  const watchedSpecialties = watch('specialties') || [];
  const watchedServiceIds = watch('service_ids') || [];

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    if (employee) {
      reset({
        name: employee.name,
        email: employee.email,
        phone: employee.phone || '',
        is_active: employee.is_active,
        specialties: employee.specialties || [],
        notes: employee.notes || '',
        service_ids: employee.services?.map(s => s.id) || [],
      });
    } else {
      reset({
        name: '',
        email: '',
        phone: '',
        is_active: true,
        specialties: [],
        notes: '',
        service_ids: [],
      });
    }
  }, [employee, reset]);

  const loadServices = async () => {
    try {
      const servicesData = await serviceService.getAll();
      setServices(servicesData);
    } catch (err) {
      console.error('Error loading services:', err);
    }
  };

  const addSpecialty = () => {
    if (specialtyInput.trim() && !watchedSpecialties.includes(specialtyInput.trim())) {
      setValue('specialties', [...watchedSpecialties, specialtyInput.trim()]);
      setSpecialtyInput('');
    }
  };

  const removeSpecialty = (specialty: string) => {
    setValue('specialties', watchedSpecialties.filter(s => s !== specialty));
  };

  const toggleService = (serviceId: number) => {
    if (watchedServiceIds.includes(serviceId)) {
      setValue('service_ids', watchedServiceIds.filter(id => id !== serviceId));
    } else {
      setValue('service_ids', [...watchedServiceIds, serviceId]);
    }
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      if (employee) {
        await employeeService.update(employee.id, data);
        success('Empleado actualizado', 'El empleado se actualizó correctamente');
      } else {
        await employeeService.create(data);
        success('Empleado creado', 'El empleado se creó correctamente');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      error('Error', err.response?.data?.message || 'Error al guardar el empleado');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={employee ? 'Editar Empleado' : 'Nuevo Empleado'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <UserCheck className="w-4 h-4" />
              <span>Nombre completo</span>
            </label>
            <input
              {...register('name')}
              type="text"
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 transition-all duration-300"
              placeholder="Ej: María González"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </label>
            <input
              {...register('email')}
              type="email"
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 transition-all duration-300"
              placeholder="maria@campinails.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4" />
              <span>Teléfono (opcional)</span>
            </label>
            <input
              {...register('phone')}
              type="tel"
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 transition-all duration-300"
              placeholder="11 1234-5678"
            />
          </div>

          <div className="flex items-center space-x-3 pt-8">
            <input
              {...register('is_active')}
              type="checkbox"
              className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label className="text-sm font-medium text-gray-700">
              Empleado activo
            </label>
          </div>
        </div>

        {/* Especialidades */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
            <Star className="w-4 h-4" />
            <span>Especialidades</span>
          </label>
          <div className="flex space-x-2 mb-3">
            <input
              type="text"
              value={specialtyInput}
              onChange={(e) => setSpecialtyInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 transition-all duration-300"
              placeholder="Ej: Diseños 3D"
            />
            <button
              type="button"
              onClick={addSpecialty}
              className="px-4 py-2 bg-indigo-500 text-white rounded-2xl hover:bg-indigo-600 transition-colors duration-200"
            >
              Agregar
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {watchedSpecialties.map((specialty, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full"
              >
                {specialty}
                <button
                  type="button"
                  onClick={() => removeSpecialty(specialty)}
                  className="ml-2 text-indigo-600 hover:text-indigo-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Servicios */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Servicios que puede realizar
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
            {services.map((service) => (
              <label
                key={service.id}
                className="flex items-center space-x-3 p-3 border border-gray-200 rounded-2xl hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={watchedServiceIds.includes(service.id)}
                  onChange={() => toggleService(service.id)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <div>
                  <div className="text-sm font-medium text-gray-800">{service.name}</div>
                  <div className="text-xs text-gray-500">{service.duration_minutes} min</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas (opcional)
          </label>
          <textarea
            {...register('notes')}
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 transition-all duration-300 resize-none"
            placeholder="Notas adicionales sobre el empleado..."
          />
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
            disabled={isLoading}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{employee ? 'Actualizar' : 'Crear'} Empleado</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};