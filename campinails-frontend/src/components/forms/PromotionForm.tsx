import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Modal } from '../ui/Modal';
import { Tag, Percent, DollarSign, Calendar, Save, X } from 'lucide-react';
import { serviceService } from '../../services/api';
import type { Service } from '../../types';

const schema = yup.object({
  name: yup.string().required('Nombre es requerido'),
  description: yup.string().optional(),
  code: yup.string().required('Código es requerido'),
  type: yup.string().required('Tipo de descuento es requerido'),
  value: yup.number().required('Valor es requerido').min(0, 'El valor debe ser mayor a 0'),
  min_amount: yup.number().nullable(),
  max_discount: yup.number().nullable(),
  usage_limit: yup.number().nullable().transform(value => (isNaN(value) ? null : value)),
  is_active: yup.boolean(),
  starts_at: yup.date().required('Fecha de inicio es requerida'),
  expires_at: yup.date().required('Fecha de expiración es requerida'),
  applicable_days: yup.array().of(yup.number()),
  applicable_services: yup.array().of(yup.number()),
});

interface PromotionFormProps {
  isOpen: boolean;
  onClose: () => void;
  promotion?: any;
  onSuccess: () => void;
}

export const PromotionForm: React.FC<PromotionFormProps> = ({
  isOpen,
  onClose,
  promotion,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);

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
      name: '',
      description: '',
      code: '',
      type: 'percentage',
      value: 0,
      min_amount: null,
      max_discount: null,
      usage_limit: null,
      is_active: true,
      starts_at: new Date(),
      expires_at: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      applicable_days: [],
      applicable_services: [],
    },
  });

  const watchedType = watch('type');
  const watchedApplicableDays = watch('applicable_days') || [];
  const watchedApplicableServices = watch('applicable_services') || [];

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    if (promotion) {
      reset({
        name: promotion.name,
        description: promotion.description || '',
        code: promotion.code,
        type: promotion.type || 'percentage',
        value: promotion.value || 0,
        min_amount: promotion.min_amount || null,
        max_discount: promotion.max_discount || null,
        usage_limit: promotion.usage_limit || null,
        is_active: promotion.is_active !== undefined ? promotion.is_active : true,
        starts_at: promotion.starts_at ? new Date(promotion.starts_at) : new Date(),
        expires_at: promotion.expires_at ? new Date(promotion.expires_at) : new Date(new Date().setMonth(new Date().getMonth() + 1)),
        applicable_days: promotion.applicable_days || [],
        applicable_services: promotion.applicable_services || [],
      });
    } else {
      reset({
        name: '',
        description: '',
        code: '',
        type: 'percentage',
        value: 0,
        min_amount: null,
        max_discount: null,
        usage_limit: null,
        is_active: true,
        starts_at: new Date(),
        expires_at: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        applicable_days: [],
        applicable_services: [],
      });
    }
  }, [promotion, reset]);

  const loadServices = async () => {
    try {
      const servicesData = await serviceService.getAll();
      setServices(servicesData);
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const toggleDay = (day: number) => {
    if (watchedApplicableDays.includes(day)) {
      setValue('applicable_days', watchedApplicableDays.filter(d => d !== day));
    } else {
      setValue('applicable_days', [...watchedApplicableDays, day]);
    }
  };

  const toggleService = (serviceId: number) => {
    if (watchedApplicableServices.includes(serviceId)) {
      setValue('applicable_services', watchedApplicableServices.filter(id => id !== serviceId));
    } else {
      setValue('applicable_services', [...watchedApplicableServices, serviceId]);
    }
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1500));
      onSuccess();
    } catch (error) {
      console.error('Error saving promotion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={promotion ? 'Editar Promoción' : 'Nueva Promoción'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4" />
              <span>Nombre de la promoción</span>
            </label>
            <input
              {...register('name')}
              type="text"
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-300 transition-all duration-300"
              placeholder="Ej: Descuento de Verano"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4" />
              <span>Código</span>
            </label>
            <input
              {...register('code')}
              type="text"
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-300 transition-all duration-300"
              placeholder="Ej: VERANO20"
            />
            {errors.code && (
              <p className="mt-1 text-sm text-red-500">{errors.code.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de descuento
            </label>
            <select
              {...register('type')}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-300 transition-all duration-300"
            >
              <option value="percentage">Porcentaje (%)</option>
              <option value="fixed">Monto fijo ($)</option>
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-500">{errors.type.message}</p>
            )}
          </div>
        </div>

        {/* Valor del descuento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              {watchedType === 'percentage' ? (
                <Percent className="w-4 h-4" />
              ) : (
                <DollarSign className="w-4 h-4" />
              )}
              <span>Valor del descuento</span>
            </label>
            <input
              {...register('value')}
              type="number"
              min="0"
              step={watchedType === 'percentage' ? '1' : '100'}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-300 transition-all duration-300"
              placeholder={watchedType === 'percentage' ? '20' : '1000'}
            />
            {errors.value && (
              <p className="mt-1 text-sm text-red-500">{errors.value.message}</p>
            )}
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4" />
              <span>Monto mínimo (opcional)</span>
            </label>
            <input
              {...register('min_amount')}
              type="number"
              min="0"
              step="100"
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-300 transition-all duration-300"
              placeholder="10000"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4" />
              <span>Descuento máximo (opcional)</span>
            </label>
            <input
              {...register('max_discount')}
              type="number"
              min="0"
              step="100"
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-300 transition-all duration-300"
              placeholder="5000"
            />
          </div>
        </div>

        {/* Fechas y límites */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4" />
              <span>Fecha de inicio</span>
            </label>
            <input
              {...register('starts_at')}
              type="date"
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-300 transition-all duration-300"
            />
            {errors.starts_at && (
              <p className="mt-1 text-sm text-red-500">{errors.starts_at.message}</p>
            )}
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4" />
              <span>Fecha de expiración</span>
            </label>
            <input
              {...register('expires_at')}
              type="date"
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-300 transition-all duration-300"
            />
            {errors.expires_at && (
              <p className="mt-1 text-sm text-red-500">{errors.expires_at.message}</p>
            )}
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4" />
              <span>Límite de usos (opcional)</span>
            </label>
            <input
              {...register('usage_limit')}
              type="number"
              min="1"
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-300 transition-all duration-300"
              placeholder="100"
            />
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción (opcional)
          </label>
          <textarea
            {...register('description')}
            rows={2}
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-300 transition-all duration-300 resize-none"
            placeholder="Descripción de la promoción..."
          />
        </div>

        {/* Días aplicables */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Días aplicables (deja vacío para todos los días)
          </label>
          <div className="flex flex-wrap gap-2">
            {dayNames.map((day, index) => (
              <button
                key={index}
                type="button"
                onClick={() => toggleDay(index)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
                  watchedApplicableDays.includes(index)
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Servicios aplicables */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Servicios aplicables (deja vacío para todos los servicios)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
            {services.map((service) => (
              <label
                key={service.id}
                className="flex items-center space-x-3 p-3 border border-gray-200 rounded-2xl hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={watchedApplicableServices.includes(service.id)}
                  onChange={() => toggleService(service.id)}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <div>
                  <div className="text-sm font-medium text-gray-800">{service.name}</div>
                  <div className="text-xs text-gray-500">${service.price.toLocaleString()}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Estado */}
        <div className="flex items-center space-x-3">
          <input
            {...register('is_active')}
            type="checkbox"
            className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
          />
          <label className="text-sm font-medium text-gray-700">
            Promoción activa
          </label>
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
            className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{promotion ? 'Actualizar' : 'Crear'} Promoción</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};