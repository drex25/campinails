import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, employeeService, serviceService, appointmentService } from '../services/api';
import type { Employee, Service } from '../types';
import ReactModal from 'react-modal';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';

type AdminSection = 'dashboard' | 'services' | 'employees';

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const user = authService.getUser();
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      navigate('/login');
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardSection />;
      case 'services':
        return <ServicesSection />;
      case 'employees':
        return <AdminEmployeesSection />;
      default:
        return <DashboardSection />;
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
              { id: 'services', label: 'Servicios', icon: '💅' },
              { id: 'employees', label: 'Empleados', icon: '🧑‍' },
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

// Componentes de sección
const DashboardSection: React.FC = () => {
  const [stats, setStats] = useState({
    appointmentsToday: 0,
    pendingDeposits: 0,
    activeClients: 0,
    totalServices: 0,
    totalEmployees: 0,
    recentAppointments: [] as any[]
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    setIsLoading(true);
    try {
      // Cargar estadísticas en paralelo
      const [appointments, services, employees] = await Promise.all([
        appointmentService.getAll({ date: new Date().toISOString().split('T')[0] }),
        serviceService.getAll(),
        employeeService.getAll({ active: true })
      ]);

      setStats({
        appointmentsToday: appointments.length,
        pendingDeposits: appointments.filter((a: any) => a.status === 'pending_deposit').length,
        activeClients: new Set(appointments.map((a: any) => a.client_id)).size,
        totalServices: services.length,
        totalEmployees: employees.length,
        recentAppointments: appointments.slice(0, 5) // Últimos 5 turnos
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <button 
          onClick={loadDashboardStats}
          className="btn-secondary text-sm"
        >
          Actualizar
        </button>
      </div>
      
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-campi-brown">{stats.appointmentsToday}</div>
            <div className="text-sm text-gray-500">Turnos Hoy</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-campi-brown">{stats.pendingDeposits}</div>
            <div className="text-sm text-gray-500">Pendientes de Seña</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-campi-brown">{stats.activeClients}</div>
            <div className="text-sm text-gray-500">Clientes Activos</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-campi-brown">{stats.totalServices}</div>
            <div className="text-sm text-gray-500">Servicios Disponibles</div>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Empleados Activos</h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-campi-brown">{stats.totalEmployees}</div>
            <div className="text-sm text-gray-500">Profesionales disponibles</div>
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Últimos Turnos</h3>
          {stats.recentAppointments.length > 0 ? (
            <div className="space-y-2">
              {stats.recentAppointments.map((appointment: any) => (
                <div key={appointment.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <div className="font-medium text-gray-900">{appointment.name}</div>
                    <div className="text-sm text-gray-500">{appointment.service?.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(appointment.scheduled_at).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(appointment.scheduled_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              No hay turnos programados para hoy
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ServicesSection: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setIsLoading(true);
    try {
      const data = await serviceService.getAll();
      setServices(data);
    } catch (error) {
      console.error('Error cargando servicios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingService(null);
    setShowModal(true);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setShowModal(true);
  };

  const handleDelete = async (service: Service) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el servicio "${service.name}"?`)) {
      try {
        await serviceService.delete(service.id);
        await loadServices();
      } catch (error) {
        console.error('Error eliminando servicio:', error);
        alert('Error al eliminar el servicio');
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingService(null);
  };

  const handleModalSave = async () => {
    setShowModal(false);
    setEditingService(null);
    await loadServices();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Servicios</h2>
        <button className="btn-primary" onClick={handleAdd}>Agregar Servicio</button>
      </div>
      
      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Servicio</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Duración</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Seña</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {services.map(service => (
              <tr key={service.id} className="border-b">
                <td className="px-4 py-2">
                  <div>
                    <div className="font-medium text-gray-900">{service.name}</div>
                    {service.description && (
                      <div className="text-sm text-gray-500">{service.description}</div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <span className="font-semibold text-campi-brown">${service.price.toLocaleString()}</span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {service.duration_minutes} min
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {service.requires_deposit ? (
                    <span className="text-sm">
                      {service.deposit_percentage}% (${Math.round(service.price * service.deposit_percentage / 100).toLocaleString()})
                    </span>
                  ) : (
                    <span className="text-gray-400">No requiere</span>
                  )}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Activo
                  </span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <button className="btn-secondary btn-sm mr-2" onClick={() => handleEdit(service)}>Editar</button>
                  <button className="btn-danger btn-sm" onClick={() => handleDelete(service)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isLoading && <div className="text-center py-4">Cargando...</div>}
        {!isLoading && services.length === 0 && <div className="text-center py-4 text-gray-500">No hay servicios registrados.</div>}
      </div>
      
      <ServiceFormModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSave={handleModalSave}
        service={editingService}
      />
    </div>
  );
};

const AdminEmployeesSection: React.FC = () => {
  console.log('AdminEmployeesSection montado');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  console.log('showModal:', showModal, 'editingEmployee:', editingEmployee);

  useEffect(() => {
    loadEmployees();
    loadServices();
  }, []);

  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      const data = await employeeService.getAll();
      setEmployees(data);
    } finally {
      setIsLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      const data = await serviceService.getAll();
      setServices(data);
    } catch {}
  };

  const handleAdd = () => {
    setEditingEmployee(null);
    setShowModal(true);
  };

  const handleEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingEmployee(null);
  };

  const handleModalSave = async () => {
    setShowModal(false);
    setEditingEmployee(null);
    await loadEmployees();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Empleados</h2>
        <button className="btn-primary" onClick={handleAdd}>Agregar Empleado</button>
      </div>
      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Servicios</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.id} className="border-b">
                <td className="px-4 py-2 whitespace-nowrap">{emp.name}</td>
                <td className="px-4 py-2 whitespace-nowrap">{emp.email}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {emp.services?.map(s => s.name).join(', ')}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {emp.is_active ? (
                    <span className="text-green-600 font-semibold">Activo</span>
                  ) : (
                    <span className="text-gray-400">Inactivo</span>
                  )}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <button className="btn-secondary btn-sm mr-2" onClick={() => handleEdit(emp)}>Editar</button>
                  <button className="btn-danger btn-sm">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isLoading && <div className="text-center py-4">Cargando...</div>}
        {!isLoading && employees.length === 0 && <div className="text-center py-4 text-gray-500">No hay empleados registrados.</div>}
      </div>
      <EmployeeFormModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSave={handleModalSave}
        employee={editingEmployee}
        services={services}
      />
    </div>
  );
};

// Modal de alta/edición de empleados
interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  employee: Employee | null;
  services: Service[];
}

const daysOfWeek = [
  { id: 1, label: 'Lunes' },
  { id: 2, label: 'Martes' },
  { id: 3, label: 'Miércoles' },
  { id: 4, label: 'Jueves' },
  { id: 5, label: 'Viernes' },
  { id: 6, label: 'Sábado' },
];

const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({ isOpen, onClose, onSave, employee, services }) => {
  const { register, handleSubmit, control, setValue, watch, reset } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      is_active: 'true',
      specialties: '',
      notes: '',
      service_ids: [] as (string | number)[],
      schedule: daysOfWeek.map(day => ({ day_of_week: day.id, start_time: '09:00', end_time: '18:00', is_active: true })),
    },
  });

  console.log('EmployeeFormModal isOpen:', isOpen);

  useEffect(() => {
    if (employee) {
      reset({
        ...employee,
        service_ids: employee.services?.map(s => s.id) || [],
        schedule: (employee as any).schedules || daysOfWeek.map(day => ({ day_of_week: day.id, start_time: '09:00', end_time: '18:00', is_active: true })),
        is_active: employee.is_active ? 'true' : 'false',
        specialties: Array.isArray(employee.specialties) ? employee.specialties.join(', ') : employee.specialties || '',
      });
    } else {
      reset();
    }
  }, [employee, reset]);

  const onSubmit = async (data: any) => {
    const payload = {
      ...data,
      specialties: Array.isArray(data.specialties)
        ? data.specialties
        : (typeof data.specialties === 'string' && data.specialties.trim() !== ''
            ? data.specialties.split(',').map((s: string) => s.trim())
            : []),
      service_ids: Array.isArray(data.service_ids)
        ? data.service_ids.map((id: any) => Number(id))
        : [],
      schedules: data.schedule,
      is_active: data.is_active === 'true' || data.is_active === true,
    };
    try {
      if (employee) {
        await employeeService.update(employee.id, payload);
      } else {
        await employeeService.create(payload);
      }
      onSave();
    } catch (err: any) {
      alert(err.response?.data?.message || JSON.stringify(err.response?.data) || 'Error al guardar');
    }
  };

  return (
    <ReactModal
      isOpen={isOpen}
      style={{
        content: {
          background: 'white',
          zIndex: 9999,
          padding: 24,
          maxWidth: 800,
          width: '90vw',
          maxHeight: '90vh',
          margin: 'auto',
          borderRadius: 12,
          overflow: 'auto',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
        },
        overlay: {
          backgroundColor: 'rgba(0,0,0,0.3)',
          zIndex: 9998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }
      }}
      onRequestClose={onClose}
      contentLabel="Empleado"
      ariaHideApp={false}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <h3 className="text-xl font-bold mb-2">{employee ? 'Editar Empleado' : 'Nuevo Empleado'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input {...register('name', { required: true })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input {...register('email')} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Teléfono</label>
            <input {...register('phone')} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Especialidades</label>
            <input {...register('specialties')} className="input-field" placeholder="Ej: Manicura, Pedicura" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Notas</label>
          <textarea {...register('notes')} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Servicios asignados</label>
          <Controller
            control={control}
            name="service_ids"
            render={({ field }) => (
              <Select
                isMulti
                options={services.map(s => ({ value: s.id, label: s.name }))}
                value={services
                  .filter(s => (field.value || []).map(Number).includes(s.id))
                  .map(s => ({ value: s.id, label: s.name }))}
                onChange={selected => field.onChange(selected.map((opt: any) => Number(opt.value)))}
                classNamePrefix="react-select"
                placeholder="Selecciona servicios..."
              />
            )}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Estado</label>
          <select {...register('is_active')} className="input-field">
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Horario semanal</label>
          <table className="min-w-full border text-xs">
            <thead>
              <tr>
                <th>Día</th>
                <th>Activo</th>
                <th>Desde</th>
                <th>Hasta</th>
              </tr>
            </thead>
            <tbody>
              {daysOfWeek.map((day, idx) => (
                <tr key={day.id}>
                  <td>{day.label}</td>
                  <td>
                    <Controller
                      control={control}
                      name={`schedule.${idx}.is_active`}
                      render={({ field }) => (
                        <input type="checkbox" checked={field.value} onChange={e => field.onChange(e.target.checked)} />
                      )}
                    />
                  </td>
                  <td>
                    <Controller
                      control={control}
                      name={`schedule.${idx}.start_time`}
                      render={({ field }) => (
                        <input type="time" className="input-field" {...field} />
                      )}
                    />
                  </td>
                  <td>
                    <Controller
                      control={control}
                      name={`schedule.${idx}.end_time`}
                      render={({ field }) => (
                        <input type="time" className="input-field" {...field} />
                      )}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn-primary">Guardar</button>
        </div>
      </form>
    </ReactModal>
  );
};

// Modal de alta/edición de servicios
interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  service: Service | null;
}

const ServiceFormModal: React.FC<ServiceFormModalProps> = ({ isOpen, onClose, onSave, service }) => {
  const { register, handleSubmit, watch, reset } = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      duration_minutes: 60,
      requires_deposit: false,
      deposit_percentage: 50,
    },
  });

  const requiresDeposit = watch('requires_deposit');

  useEffect(() => {
    if (service) {
      reset({
        ...service,
        requires_deposit: service.requires_deposit || false,
        deposit_percentage: service.deposit_percentage || 50,
      });
    } else {
      reset();
    }
  }, [service, reset]);

  const onSubmit = async (data: any) => {
    const payload = {
      ...data,
      price: Number(data.price),
      duration_minutes: Number(data.duration_minutes),
      deposit_percentage: data.requires_deposit ? Number(data.deposit_percentage) : null,
      requires_deposit: data.requires_deposit || false,
    };
    
    try {
      if (service) {
        await serviceService.update(service.id, payload);
      } else {
        await serviceService.create(payload);
      }
      onSave();
    } catch (err: any) {
      alert(err.response?.data?.message || JSON.stringify(err.response?.data) || 'Error al guardar');
    }
  };

  return (
    <ReactModal
      isOpen={isOpen}
      style={{
        content: {
          background: 'white',
          zIndex: 9999,
          padding: 24,
          maxWidth: 600,
          width: '90vw',
          maxHeight: '90vh',
          margin: 'auto',
          borderRadius: 12,
          overflow: 'auto',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
        },
        overlay: {
          backgroundColor: 'rgba(0,0,0,0.3)',
          zIndex: 9998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }
      }}
      onRequestClose={onClose}
      contentLabel="Servicio"
      ariaHideApp={false}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <h3 className="text-xl font-bold mb-2">{service ? 'Editar Servicio' : 'Nuevo Servicio'}</h3>
        
        <div>
          <label className="block text-sm font-medium mb-1">Nombre del servicio *</label>
          <input {...register('name', { required: true })} className="input-field" placeholder="Ej: Manicura completa" />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Descripción</label>
          <textarea {...register('description')} className="input-field" rows={3} placeholder="Descripción del servicio..." />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Precio *</label>
            <input {...register('price', { required: true, min: 0 })} type="number" className="input-field" placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Duración (minutos) *</label>
            <input {...register('duration_minutes', { required: true, min: 15 })} type="number" className="input-field" placeholder="60" />
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center">
            <input 
              {...register('requires_deposit')} 
              type="checkbox" 
              id="requires_deposit"
              className="mr-2"
            />
            <label htmlFor="requires_deposit" className="text-sm font-medium">
              Requiere seña
            </label>
          </div>
          
          {requiresDeposit && (
            <div>
              <label className="block text-sm font-medium mb-1">Porcentaje de seña (%)</label>
              <input 
                {...register('deposit_percentage', { min: 10, max: 100 })} 
                type="number" 
                className="input-field" 
                placeholder="50"
              />
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-2 mt-6">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn-primary">Guardar</button>
        </div>
      </form>
    </ReactModal>
  );
}; 