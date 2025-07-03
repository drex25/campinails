import React, { useState } from 'react';
import { BarChart3, TrendingUp, Download, Calendar, DollarSign, Users, Clock, Filter, FileText, PieChart } from 'lucide-react';

export const ReportsSection: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('revenue');

  const reportTypes = [
    { id: 'revenue', name: 'Ingresos', icon: DollarSign, color: 'from-green-500 to-emerald-500' },
    { id: 'appointments', name: 'Turnos', icon: Clock, color: 'from-blue-500 to-indigo-500' },
    { id: 'clients', name: 'Clientes', icon: Users, color: 'from-purple-500 to-pink-500' },
    { id: 'services', name: 'Servicios', icon: BarChart3, color: 'from-orange-500 to-red-500' },
  ];

  const periods = [
    { id: 'week', name: 'Esta Semana' },
    { id: 'month', name: 'Este Mes' },
    { id: 'quarter', name: 'Este Trimestre' },
    { id: 'year', name: 'Este Año' },
  ];

  // Datos de ejemplo para los gráficos
  const revenueData = [
    { date: '2024-01-01', amount: 45000 },
    { date: '2024-01-02', amount: 52000 },
    { date: '2024-01-03', amount: 38000 },
    { date: '2024-01-04', amount: 61000 },
    { date: '2024-01-05', amount: 55000 },
    { date: '2024-01-06', amount: 48000 },
    { date: '2024-01-07', amount: 42000 },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Reportes y Analytics</h2>
              <p className="text-gray-600">Análisis detallado de tu negocio</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </button>
            
            <button className="p-2 rounded-2xl border border-gray-200 hover:bg-gray-50 transition-colors duration-200">
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-violet-100 focus:border-violet-300 transition-all duration-300"
            >
              {periods.map(period => (
                <option key={period.id} value={period.id}>{period.name}</option>
              ))}
            </select>

            <div className="flex items-center bg-gray-100 rounded-2xl p-1">
              {reportTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedReport(type.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                      selectedReport === type.id
                        ? 'bg-white text-gray-800 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{type.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-800">$2.840.000</div>
              <div className="text-sm text-gray-600">Ingresos totales</div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">+12.5% vs mes anterior</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-800">156</div>
              <div className="text-sm text-gray-600">Turnos completados</div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-blue-600">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">+8.3% vs mes anterior</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-800">89</div>
              <div className="text-sm text-gray-600">Clientes activos</div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-purple-600">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">+15.2% vs mes anterior</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-800">$18.205</div>
              <div className="text-sm text-gray-600">Ticket promedio</div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-orange-600">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">+5.7% vs mes anterior</span>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Tendencia de Ingresos</h3>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">Últimos 7 días</span>
          </div>
        </div>

        {/* Simple Bar Chart */}
        <div className="h-80 flex items-end justify-between space-x-2">
          {revenueData.map((item, index) => {
            const maxAmount = Math.max(...revenueData.map(d => d.amount));
            const height = (item.amount / maxAmount) * 100;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col items-center">
                  <div className="text-xs text-gray-600 mb-2">{formatCurrency(item.amount)}</div>
                  <div
                    className="w-full bg-gradient-to-t from-violet-500 to-purple-500 rounded-t-lg transition-all duration-500 hover:from-violet-600 hover:to-purple-600"
                    style={{ height: `${height}%`, minHeight: '20px' }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {new Date(item.date).toLocaleDateString('es-ES', { weekday: 'short' })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Services Performance */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Servicios Más Populares</h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            {[
              { name: 'Esmaltado semi permanente', count: 45, percentage: 35, color: 'bg-pink-500' },
              { name: 'Manicuria', count: 32, percentage: 25, color: 'bg-purple-500' },
              { name: 'Capping con polygel', count: 28, percentage: 22, color: 'bg-blue-500' },
              { name: 'Soft Gel', count: 23, percentage: 18, color: 'bg-green-500' },
            ].map((service, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${service.color}`} />
                  <span className="text-sm text-gray-700">{service.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${service.color}`}
                      style={{ width: `${service.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-800 w-8">{service.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Client Retention */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Retención de Clientes</h3>
            <Users className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">75.3%</div>
              <div className="text-sm text-gray-600">Tasa de retención</div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Clientes nuevos</span>
                <span className="font-semibold text-gray-800">23</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Clientes recurrentes</span>
                <span className="font-semibold text-gray-800">67</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Clientes VIP (5+ visitas)</span>
                <span className="font-semibold text-gray-800">18</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Reports */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Reportes Rápidos</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Reporte de Ventas', desc: 'Ingresos detallados por período', icon: DollarSign },
            { title: 'Análisis de Clientes', desc: 'Comportamiento y preferencias', icon: Users },
            { title: 'Performance de Servicios', desc: 'Servicios más y menos populares', icon: BarChart3 },
          ].map((report, index) => {
            const Icon = report.icon;
            return (
              <button
                key={index}
                className="p-4 border border-gray-200 rounded-2xl hover:border-violet-300 hover:bg-violet-50 transition-all duration-200 text-left group"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-violet-100 group-hover:bg-violet-200 rounded-xl flex items-center justify-center transition-colors duration-200">
                    <Icon className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">{report.title}</h4>
                    <p className="text-sm text-gray-600">{report.desc}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-violet-600 font-medium">Generar reporte</span>
                  <FileText className="w-4 h-4 text-violet-600" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};