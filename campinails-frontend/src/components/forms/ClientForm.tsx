import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { clientService } from '../../services/api';
import type { Client } from '../../types';
import { Modal } from '../ui/Modal';
import { Users, Mail, Phone, FileText, Save, X } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

const schema = yup.object({
  name: yup.string().required('Nombre es requerido'),
  whatsapp: yup.string().required('WhatsApp es requerido'),
  email: yup.string().email('Email inválido').optional(),
  notes: yup.string().optional(),
  is_active: yup.boolean(),
});

interface ClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null;
  onSuccess: () => void;
}

export const ClientForm: React.FC<ClientFormProps> = ({
  isOpen,
  onClose,
  client,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { success, error } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      whatsapp: '',
      email: '',
      notes: '',
      is_active: true,
    },
  });

  useEffect(() => {
    if (client) {
      reset({
        name: client.name,
        whatsapp: client.whatsapp,
        email: client.email || '',
        notes: client.notes || '',
        is_active: client.is_active,
      });
    } else {
      reset({
        name: '',
        whatsapp: '',
        email: '',
        notes: '',
        is_active: true,
      });
    }
  }, [client, reset]);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      if (client) {
        await clientService.update(client.id, data);
        success('Cliente actualizado', 'El cliente se actualizó correctamente');
      } else {
        await clientService.create(data);
        success('Cliente creado', 'El cliente se creó correctamente');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      error('Error', err.response?.data?.message || 'Error al guardar el cliente');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={client ? 'Editar Cliente' : 'Nuevo Cliente'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Información básica */}
        <div className="space-y-4">
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4" />
              <span>Nombre completo</span>
            </label>
            <input
              {...register('name')}
              type="text"
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all duration-300"
              placeholder="Ej: María González"
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
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all duration-300"
              placeholder="11 1234-5678"
            />
            {errors.whatsapp && (
              <p className="mt-1 text-sm text-red-500">{errors.whatsapp.message}</p>
            )}
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4" />
              <span>Email (opcional)</span>
            </label>
            <input
              {...register('email')}
              type="email"
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all duration-300"
              placeholder="maria@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4" />
              <span>Notas (opcional)</span>
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition-all duration-300 resize-none"
              placeholder="Preferencias, alergias, notas especiales..."
            />
          </div>

          <div className="flex items-center space-x-3">
            <input
              {...register('is_active')}
              type="checkbox"
              className="w-5 h-5 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
            />
            <label className="text-sm font-medium text-gray-700">
              Cliente activo
            </label>
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
            disabled={isLoading}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-2xl hover:from-pink-600 hover:to-purple-600 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{client ? 'Actualizar' : 'Crear'} Cliente</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};