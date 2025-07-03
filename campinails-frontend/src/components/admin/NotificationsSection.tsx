import React from 'react';
import { Bell, MessageSquare, Mail, Phone, Send, Plus } from 'lucide-react';

export const NotificationsSection: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Notificaciones</h2>
              <p className="text-gray-600">Centro de comunicaciones</p>
            </div>
          </div>

          <button className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-lg">
            <Plus className="w-5 h-5" />
            <span>Nueva Notificación</span>
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">WhatsApp</h3>
              <p className="text-sm text-gray-600">Mensajes directos</p>
            </div>
          </div>
          <button className="w-full py-3 bg-green-50 text-green-600 rounded-2xl hover:bg-green-100 transition-colors duration-200 font-medium">
            Enviar Mensaje
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Email</h3>
              <p className="text-sm text-gray-600">Correos masivos</p>
            </div>
          </div>
          <button className="w-full py-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition-colors duration-200 font-medium">
            Enviar Email
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">SMS</h3>
              <p className="text-sm text-gray-600">Mensajes de texto</p>
            </div>
          </div>
          <button className="w-full py-3 bg-purple-50 text-purple-600 rounded-2xl hover:bg-purple-100 transition-colors duration-200 font-medium">
            Enviar SMS
          </button>
        </div>
      </div>

      {/* Recent Notifications */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Notificaciones Recientes</h3>
        
        <div className="space-y-4">
          {/* Placeholder notifications */}
          {[
            { type: 'whatsapp', message: 'Recordatorio de turno enviado a María González', time: 'Hace 5 min', status: 'sent' },
            { type: 'email', message: 'Promoción de fin de mes enviada a 45 clientes', time: 'Hace 1 hora', status: 'sent' },
            { type: 'sms', message: 'Confirmación de turno enviada a Ana Rodríguez', time: 'Hace 2 horas', status: 'failed' },
          ].map((notification, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                notification.type === 'whatsapp' ? 'bg-green-100' :
                notification.type === 'email' ? 'bg-blue-100' : 'bg-purple-100'
              }`}>
                {notification.type === 'whatsapp' && <MessageSquare className="w-5 h-5 text-green-600" />}
                {notification.type === 'email' && <Mail className="w-5 h-5 text-blue-600" />}
                {notification.type === 'sms' && <Phone className="w-5 h-5 text-purple-600" />}
              </div>
              
              <div className="flex-1">
                <p className="text-sm text-gray-800">{notification.message}</p>
                <p className="text-xs text-gray-500">{notification.time}</p>
              </div>
              
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                notification.status === 'sent' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {notification.status === 'sent' ? 'Enviado' : 'Falló'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Templates */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Plantillas de Mensajes</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'Confirmación de Turno', preview: '¡Hola! Tu turno para {servicio} está confirmado para el {fecha} a las {hora}.' },
            { title: 'Recordatorio 24h', preview: 'Te recordamos que mañana tienes tu turno a las {hora} para {servicio}.' },
            { title: 'Promoción Especial', preview: '¡Oferta especial! {descuento}% de descuento en {servicio} hasta {fecha}.' },
            { title: 'Seguimiento Post-Servicio', preview: 'Esperamos que hayas disfrutado tu experiencia. ¡Nos encantaría verte pronto!' },
          ].map((template, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-2xl hover:border-gray-300 transition-colors duration-200">
              <h4 className="font-medium text-gray-800 mb-2">{template.title}</h4>
              <p className="text-sm text-gray-600 mb-3">{template.preview}</p>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Usar plantilla
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};