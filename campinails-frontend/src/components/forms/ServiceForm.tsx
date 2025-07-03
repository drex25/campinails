import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { serviceService } from '../../services/api';
import type { Service } from '../../types';
import { Modal } from '../ui/Modal';
import { Scissors, DollarSign, Clock, Percent, Save, X } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

const schema = yup.object({
  name: yup.string().required('Nombre es requerido'),
  description: yup.string().optional(),
  duration_minutes: yup.number().required('Duración es requerida').min(15, 'Mínimo 15 minutos'),
  price: yup.number().required('Precio es requerido').min(0, 'El precio debe ser mayor a 0'),
  is_active: yup.boolean(),
  requires_deposit: yup.boolean(),
  deposit_percentage: yup.number().min(0, 'Mínimo 0%').max(100, 'Máximo 100%'),
});

interface ServiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  service?: Service | null;
  onSuccess: () => void;
}

export const ServiceForm: React.FC<ServiceFormProps> = ({
  isOpen,
  onClose,
  service,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { success, error } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      duration_minutes: 60,
      price: 0,
      is_active: true,
      requires_deposit: true,
      deposit_percentage: 50,
    },
  });

  const requiresDeposit = watch('requires_deposit');

  useEffect(() => {
    if (service) {
      reset({
        name: service.name,
        description: service.description || '',
        duration_minutes: service.duration_minutes,
        price: service.price,
        is_active: service.is_active,
        requires_deposit: service.requires_deposit,
        deposit_percentage: service.deposit_percentage,
      });
    } else {
      reset({
        name: '',
        description: '',
        duration_minutes: 60,
        price: 0,
        is_active: true,
        requires_deposit: true,
        deposit_percentage: 50,
      });
    }
  }, [service, reset]);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      if (service) {
        await serviceService.update(service.id, data);
        success('Servicio actualizado', 'El servicio se actualizó correctamente');
      } else {
        await serviceService.create(data);
        success('Servicio creado', 'El servicio se creó correctamente');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      error('Error', err.response?.data?.message || 'Error al guardar el servicio');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={service ? 'Editar Servicio' : 'Nuevo Servicio'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Scissors className="w-4 h-4" />
              <span>Nombre del servicio</span>
            </label>
            <input
              {...register('name')}
              type="text"
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all duration-300"
              placeholder="Ej: Manicura completa"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4" />
              <span>Duración (minutos)</span>
            </label>
            <input
              {...register('duration_minutes')}
              type="number"
              min="15"
              step="15"
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all duration-300"
              placeholder="60"
            />
            {errors.duration_minutes && (
              <p className="mt-1 text-sm text-red-500">{errors.duration_minutes.message}</p>
            )}
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4" />
              <span>Precio</span>
            </label>
            <input
              {...register('price')}
              type="number"
              min="0"
              step="100"
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all duration-300"
              placeholder="15000"
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-500">{errors.price.message}</p>
            )}
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción (opcional)
          </label>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all duration-300 resize-none"
            placeholder="Descripción del servicio..."
          />
        </div>

        {/* Configuración de seña */}
        <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
          <div className="flex items-center space-x-3">
            <input
              {...register('requires_deposit')}
              type="checkbox"
              className="w-5 h-5 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
            />
            <label className="text-sm font-medium text-gray-700">
              Requiere seña para confirmar
            </label>
          </div>

          {requiresDeposit && (
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Percent className="w-4 h-4" />
                <span>Porcentaje de seña</span>
              </label>
              <input
                {...register('deposit_percentage')}
                type="number"
                min="0"
                max="100"
                step="5"
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all duration-300"
                placeholder="50"
              />
              {errors.deposit_percentage && (
                <p className="mt-1 text-sm text-red-500">{errors.deposit_percentage.message}</p>
              )}
            </div>
          )}
        </div>

        {/* Estado */}
        <div className="flex items-center space-x-3">
          <input
            {...register('is_active')}
            type="checkbox"
            className="w-5 h-5 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
          />
          <label className="text-sm font-medium text-gray-700">
            Servicio activo
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
            className="flex-1 py-3 px-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl hover:from-pink-600 hover:to-rose-600 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{service ? 'Actualizar' : 'Crear'} Servicio</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};