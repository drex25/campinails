import React, { useState, useEffect } from 'react';
import { employeeService, serviceService } from '../../services/api';
import type { Employee, Service } from '../../types';
import { UserCheck, Plus, Search, Mail, Phone, Star, Calendar, Settings } from 'lucide-react';

export const EmployeesSection: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [employeesData, servicesData] = await Promise.all([
        employeeService.getAll(),
        serviceService.getAll()
      ]);
      setEmployees(employeesData);
      setServices(servicesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (employee.specialties && employee.specialties.some(specialty => 
      specialty.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-3xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Empleados</h2>
              <p className="text-gray-600">Gestiona tu equipo de trabajo</p>
            </div>
          </div>

          <button className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-lg">
            <Plus className="w-5 h-5" />
            <span>Nuevo Empleado</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o especialidad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 transition-all duration-300"
          />
        </div>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((employee) => (
          <div
            key={employee.id}
            className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
          >
            {/* Employee Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <UserCheck className="w-8 h-8" />
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  employee.is_active ? 'bg-green-400' : 'bg-gray-400'
                }`}></div>
              </div>
              <h3 className="text-xl font-bold mb-1">{employee.name}</h3>
              <p className="text-indigo-100 text-sm">{employee.email}</p>
            </div>

            {/* Employee Details */}
            <div className="p-6">
              {/* Contact Info */}
              <div className="space-y-3 mb-4">
                {employee.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">{employee.phone}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-600">{employee.email}</span>
                </div>
              </div>

              {/* Specialties */}
              {employee.specialties && employee.specialties.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Star className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-gray-700">Especialidades</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {employee.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Services */}
              {employee.services && employee.services.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Settings className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">Servicios</span>
                  </div>
                  <div className="space-y-1">
                    {employee.services.slice(0, 3).map((service) => (
                      <div key={service.id} className="text-xs text-gray-600">
                        • {service.name}
                      </div>
                    ))}
                    {employee.services.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{employee.services.length - 3} más
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {employee.notes && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-2xl">
                    {employee.notes}
                  </p>
                </div>
              )}

              {/* Status and Actions */}
              <div className="space-y-3">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  employee.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {employee.is_active ? 'Activo' : 'Inactivo'}
                </div>

                <div className="flex items-center space-x-2">
                  <button className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition-colors duration-200">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">Horarios</span>
                  </button>
                  
                  <button className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-purple-50 text-purple-600 rounded-2xl hover:bg-purple-100 transition-colors duration-200">
                    <Settings className="w-4 h-4" />
                    <span className="text-sm font-medium">Editar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredEmployees.length === 0 && (
        <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserCheck className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {searchTerm ? 'No se encontraron empleados' : 'No hay empleados'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? 'Intenta con otros términos de búsqueda'
              : 'Comienza agregando tu primer empleado'
            }
          </p>
          {!searchTerm && (
            <button className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105">
              Agregar Primer Empleado
            </button>
          )}
        </div>
      )}
    </div>
  );
};