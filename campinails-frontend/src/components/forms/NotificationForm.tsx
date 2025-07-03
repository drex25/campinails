import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Modal } from '../ui/Modal';
import { Bell, MessageSquare, Mail, Phone, Calendar, Users, Send, X } from 'lucide-react';
import { clientService } from '../../services/api';
import type { Client } from '../../types';

const schema = yup.object({
  type: yup.string().required('Tipo de notificación es requerido'),
  recipient_type: yup.string().required('Tipo de destinatario es requerido'),
  recipient_ids: yup.array().of(yup.number()).min(1, 'Debes seleccionar al menos un destinatario'),
  title: yup.string().required('Título es requerido'),
  message: yup.string().required('Mensaje es requerido'),
  scheduled_for: yup.date().nullable().transform(value => (value === '' ? null : value)),
});

interface NotificationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const NotificationForm: React.FC<NotificationFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClients, setSelectedClients] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

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
      type: 'whatsapp',
      recipient_type: 'client',
      recipient_ids: [],
      title: '',
      message: '',
      scheduled_for: null,
    },
  });

  const watchedType = watch('type');
  const watchedRecipientType = watch('recipient_type');

  useEffect(() => {
    if (isOpen) {
      loadClients();
    }
  }, [isOpen]);

  useEffect(() => {
    setValue('recipient_ids', selectedClients);
  }, [selectedClients, setValue]);

  const loadClients = async () => {
    try {
      const data = await clientService.getAll();
      setClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const toggleClient = (clientId: number) => {
    if (selectedClients.includes(clientId)) {
      setSelectedClients(selectedClients.filter(id => id !== clientId));
      setSelectAll(false);
    } else {
      setSelectedClients([...selectedClients, clientId]);
      if (selectedClients.length + 1 === clients.length) {
        setSelectAll(true);
      }
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedClients([]);
    } else {
      setSelectedClients(clients.map(client => client.id));
    }
    setSelectAll(!selectAll);
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Simular envío
      await new Promise(resolve => setTimeout(resolve, 1500));
      reset();
      onSuccess();
    } catch (error) {
      console.error('Error sending notification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = () => {
    switch (watchedType) {
      case 'whatsapp':
        return <MessageSquare className="w-5 h-5 text-green-600" />;
      case 'email':
        return <Mail className="w-5 h-5 text-blue-600" />;
      case 'sms':
        return <Phone className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-yellow-600" />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Enviar Notificación"
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Tipo de notificación */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tipo de notificación
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { id: 'whatsapp', name: 'WhatsApp', icon: MessageSquare, color: 'from-green-500 to-emerald-500' },
              { id: 'email', name: 'Email', icon: Mail, color: 'from-blue-500 to-indigo-500' },
              { id: 'sms', name: 'SMS', icon: Phone, color: 'from-purple-500 to-pink-500' },
            ].map(type => {
              const Icon = type.icon;
              return (
                <label
                  key={type.id}
                  className={`flex items-center space-x-3 p-3 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${
                    watchedType === type.id
                      ? 'border-yellow-300 bg-yellow-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    {...register('type')}
                    value={type.id}
                    className="sr-only"
                  />
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${type.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-gray-800">{type.name}</span>
                </label>
              );
            })}
          </div>
          {errors.type && (
            <p className="mt-1 text-sm text-red-500">{errors.type.message}</p>
          )}
        </div>

        {/* Destinatarios */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Destinatarios
          </label>
          <div className="mb-3">
            <select
              {...register('recipient_type')}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-yellow-100 focus:border-yellow-300 transition-all duration-300"
            >
              <option value="client">Clientes</option>
              <option value="employee">Empleados</option>
            </select>
            {errors.recipient_type && (
              <p className="mt-1 text-sm text-red-500">{errors.recipient_type.message}</p>
            )}
          </div>

          {watchedRecipientType === 'client' && (
            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                  />
                  <span className="font-medium text-gray-700">Seleccionar todos</span>
                </label>
                <span className="text-sm text-gray-500">{selectedClients.length} seleccionados</span>
              </div>
              <div className="max-h-48 overflow-y-auto p-2 space-y-1">
                {clients.map(client => (
                  <label
                    key={client.id}
                    className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedClients.includes(client.id)}
                      onChange={() => toggleClient(client.id)}
                      className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-800">{client.name}</div>
                      <div className="text-xs text-gray-500">{client.whatsapp}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
          {errors.recipient_ids && (
            <p className="mt-1 text-sm text-red-500">{errors.recipient_ids.message}</p>
          )}
        </div>

        {/* Título y mensaje */}
        <div className="space-y-4">
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Bell className="w-4 h-4" />
              <span>Título</span>
            </label>
            <input
              {...register('title')}
              type="text"
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-yellow-100 focus:border-yellow-300 transition-all duration-300"
              placeholder="Ej: Recordatorio de turno"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              {getTypeIcon()}
              <span>Mensaje</span>
            </label>
            <textarea
              {...register('message')}
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-yellow-100 focus:border-yellow-300 transition-all duration-300 resize-none"
              placeholder="Escribe tu mensaje aquí..."
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>
            )}
          </div>
        </div>

        {/* Programación */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4" />
            <span>Programar para (opcional)</span>
          </label>
          <input
            {...register('scheduled_for')}
            type="datetime-local"
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-yellow-100 focus:border-yellow-300 transition-all duration-300"
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
            disabled={isLoading || selectedClients.length === 0}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Enviar Notificación</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};