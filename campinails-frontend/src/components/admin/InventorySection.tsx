import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Filter, TrendingDown, TrendingUp, AlertTriangle, BarChart3, Edit, Trash2 } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description?: string;
  sku: string;
  category: string;
  brand?: string;
  cost_price: number;
  selling_price?: number;
  stock_quantity: number;
  min_stock_level: number;
  max_stock_level?: number;
  unit: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const InventorySection: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showLowStock, setShowLowStock] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Datos de ejemplo
      setProducts([
        {
          id: 1,
          name: 'Esmalte Gel UV Rosa Pastel',
          description: 'Esmalte gel de larga duración color rosa pastel',
          sku: 'ESM-001',
          category: 'Esmaltes',
          brand: 'OPI',
          cost_price: 2500,
          selling_price: 4000,
          stock_quantity: 5,
          min_stock_level: 10,
          max_stock_level: 50,
          unit: 'unidad',
          is_active: true,
          notes: 'Color muy popular',
          created_at: '2024-01-01',
          updated_at: '2024-01-15'
        },
        {
          id: 2,
          name: 'Lima de Uñas Profesional',
          description: 'Lima de uñas grano 180/240',
          sku: 'LIM-001',
          category: 'Herramientas',
          brand: 'Nail Pro',
          cost_price: 150,
          selling_price: 300,
          stock_quantity: 25,
          min_stock_level: 20,
          max_stock_level: 100,
          unit: 'unidad',
          is_active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-15'
        },
        {
          id: 3,
          name: 'Base Coat Fortalecedora',
          description: 'Base coat que fortalece las uñas',
          sku: 'BASE-001',
          category: 'Tratamientos',
          brand: 'Essie',
          cost_price: 1800,
          selling_price: 3200,
          stock_quantity: 0,
          min_stock_level: 5,
          max_stock_level: 30,
          unit: 'unidad',
          is_active: true,
          notes: 'Agotado - reordenar urgente',
          created_at: '2024-01-01',
          updated_at: '2024-01-15'
        }
      ]);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStockStatus = (product: Product) => {
    if (product.stock_quantity === 0) {
      return { status: 'out', color: 'bg-red-100 text-red-800 border-red-200', text: 'Sin Stock' };
    } else if (product.stock_quantity <= product.min_stock_level) {
      return { status: 'low', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', text: 'Stock Bajo' };
    } else {
      return { status: 'good', color: 'bg-green-100 text-green-800 border-green-200', text: 'Stock OK' };
    }
  };

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    
    const matchesLowStock = !showLowStock || product.stock_quantity <= product.min_stock_level;
    
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const totalValue = products.reduce((sum, product) => sum + (product.stock_quantity * product.cost_price), 0);
  const lowStockCount = products.filter(p => p.stock_quantity <= p.min_stock_level && p.stock_quantity > 0).length;
  const outOfStockCount = products.filter(p => p.stock_quantity === 0).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-3xl"></div>
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
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Inventario</h2>
              <p className="text-gray-600">Gestiona tu stock de productos</p>
            </div>
          </div>

          <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 shadow-lg">
            <Plus className="w-5 h-5" />
            <span>Nuevo Producto</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Productos</p>
                <p className="text-2xl font-bold text-blue-800">{products.length}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Valor Total</p>
                <p className="text-2xl font-bold text-green-800">{formatCurrency(totalValue)}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-4 border border-yellow-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Stock Bajo</p>
                <p className="text-2xl font-bold text-yellow-800">{lowStockCount}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-4 border border-red-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Sin Stock</p>
                <p className="text-2xl font-bold text-red-800">{outOfStockCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-cyan-100 focus:border-cyan-300 transition-all duration-300 w-64"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-cyan-100 focus:border-cyan-300 transition-all duration-300"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'Todas las categorías' : category}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowLowStock(!showLowStock)}
              className={`px-4 py-2 rounded-2xl transition-all duration-300 ${
                showLowStock
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Solo Stock Bajo
            </button>

            <button className="p-2 rounded-2xl border border-gray-200 hover:bg-gray-50 transition-colors duration-200">
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => {
          const stockStatus = getStockStatus(product);
          
          return (
            <div
              key={product.id}
              className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
            >
              {/* Product Header */}
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
                    {product.sku}
                  </span>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium border ${stockStatus.color}`}>
                    {stockStatus.text}
                  </div>
                </div>
                <h3 className="font-bold text-lg leading-tight">{product.name}</h3>
                {product.brand && (
                  <p className="text-cyan-100 text-sm">{product.brand}</p>
                )}
              </div>

              {/* Product Details */}
              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Categoría</span>
                    <span className="text-sm font-medium text-gray-800">{product.category}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Stock Actual</span>
                    <span className={`text-sm font-bold ${
                      product.stock_quantity === 0 ? 'text-red-600' :
                      product.stock_quantity <= product.min_stock_level ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {product.stock_quantity} {product.unit}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Stock Mínimo</span>
                    <span className="text-sm font-medium text-gray-800">{product.min_stock_level}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Costo</span>
                    <span className="text-sm font-bold text-gray-800">{formatCurrency(product.cost_price)}</span>
                  </div>

                  {product.selling_price && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Precio Venta</span>
                      <span className="text-sm font-bold text-green-600">{formatCurrency(product.selling_price)}</span>
                    </div>
                  )}

                  {/* Stock Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">Nivel de Stock</span>
                      <span className="text-xs text-gray-500">
                        {Math.round((product.stock_quantity / (product.max_stock_level || product.min_stock_level * 2)) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          product.stock_quantity === 0 ? 'bg-red-500' :
                          product.stock_quantity <= product.min_stock_level ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{
                          width: `${Math.min(100, (product.stock_quantity / (product.max_stock_level || product.min_stock_level * 2)) * 100)}%`
                        }}
                      />
                    </div>
                  </div>

                  {product.notes && (
                    <div className="mt-3 p-2 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-600">{product.notes}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-100">
                  <button className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors duration-200 text-sm">
                    <Edit className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                  
                  <button className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors duration-200 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span>Stock</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {searchTerm || selectedCategory !== 'all' || showLowStock ? 'No se encontraron productos' : 'No hay productos'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedCategory !== 'all' || showLowStock
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Comienza agregando tu primer producto al inventario'
            }
          </p>
          {!searchTerm && selectedCategory === 'all' && !showLowStock && (
            <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105">
              Agregar Primer Producto
            </button>
          )}
        </div>
      )}
    </div>
  );
};