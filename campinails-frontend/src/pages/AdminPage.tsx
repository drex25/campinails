import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { AdminCalendar } from '../components/AdminCalendar';
import type { TimeSlot } from '../types';

type AdminSection = 'dashboard' | 'calendar' | 'services' | 'appointments' | 'clients';

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const user = authService.getUser();
  const [activeSection, setActiveSection] = useState<AdminSection>('calendar');

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      navigate('/login');
    }
  };

  const handleSlotClick = (slot: TimeSlot) => {
    console.log('Slot clicked:', slot);
    // Aquí puedes abrir un modal para editar el slot
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'calendar':
        return <AdminCalendar onSlotClick={handleSlotClick} />;
      case 'dashboard':
        return <DashboardSection />;
      case 'services':
        return <ServicesSection />;
      case 'appointments':
        return <AppointmentsSection />;
      case 'clients':
        return <ClientsSection />;
      default:
        return <AdminCalendar onSlotClick={handleSlotClick} />;
    }
  };

  return (
    <div className="min-h-screen bg-campi-pink">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-campi-brown rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-sm font-bold">C</span>
              </div>
              <h1 className="text-xl font-semibold text-campi-brown">
                Campi Nails - Panel de Administración
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Bienvenido, {user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="btn-secondary text-sm px-4 py-2"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'calendar', label: 'Calendario', icon: '📅' },
              { id: 'services', label: 'Servicios', icon: '💅' },
              { id: 'appointments', label: 'Turnos', icon: '📋' },
              { id: 'clients', label: 'Clientes', icon: '👥' },
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as AdminSection)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeSection === section.id
                    ? 'border-campi-brown text-campi-brown'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{section.icon}</span>
                <span>{section.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {renderSection()}
        </div>
      </main>
    </div>
  );
};

// Componentes de sección (placeholder por ahora)
const DashboardSection: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="card">
        <div className="text-center">
          <div className="text-2xl font-bold text-campi-brown">0</div>
          <div className="text-sm text-gray-500">Turnos Hoy</div>
        </div>
      </div>
      <div className="card">
        <div className="text-center">
          <div className="text-2xl font-bold text-campi-brown">0</div>
          <div className="text-sm text-gray-500">Pendientes de Seña</div>
        </div>
      </div>
      <div className="card">
        <div className="text-center">
          <div className="text-2xl font-bold text-campi-brown">0</div>
          <div className="text-sm text-gray-500">Clientes Activos</div>
        </div>
      </div>
      <div className="card">
        <div className="text-center">
          <div className="text-2xl font-bold text-campi-brown">7</div>
          <div className="text-sm text-gray-500">Servicios Disponibles</div>
        </div>
      </div>
    </div>
  </div>
);

const ServicesSection: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900">Gestión de Servicios</h2>
    <div className="card">
      <p className="text-gray-600">Aquí irá la gestión de servicios...</p>
    </div>
  </div>
);

const AppointmentsSection: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900">Gestión de Turnos</h2>
    <div className="card">
      <p className="text-gray-600">Aquí irá la gestión de turnos...</p>
    </div>
  </div>
);

const ClientsSection: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900">Gestión de Clientes</h2>
    <div className="card">
      <p className="text-gray-600">Aquí irá la gestión de clientes...</p>
    </div>
  </div>
); 