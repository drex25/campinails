import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Modal } from '../ui/Modal';
import { Package, Tag, DollarSign, Save, X } from 'lucide-react';

const schema = yup.object({
  name: yup.string().required('Nombre es requerido'),
  description: yup.string().optional(),
  sku: yup.string().required('SKU es requerido'),
  category: yup.string().required('Categoría es requerida'),
  brand: yup.string().optional(),
  cost_price: yup.number().required('Precio de costo es requerido').min(0, 'El precio debe ser mayor a 0'),
  selling_price: yup.number().nullable().transform(value => (isNaN(value) ? null : value)),
  stock_quantity: yup.number().required('Cantidad de stock es requerida').min(0, 'El stock no puede ser negativo'),
  min_stock_level: yup.number().required('Nivel mínimo de stock es requerido').min(0, 'El nivel mínimo no puede ser negativo'),
  max_stock_level: yup.number().nullable().transform(value => (isNaN(value) ? null : value)),
  unit: yup.string().required('Unidad es requerida'),
  is_active: yup.boolean(),
  notes: yup.string().optional(),
});

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any;
  onSuccess: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  isOpen,
  onClose,
  product,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      sku: '',
      category: '',
      brand: '',
      cost_price: 0,
      selling_price: null,
      stock_quantity: 0,
      min_stock_level: 5,
      max_stock_level: null,
      unit: 'unidad',
      is_active: true,
      notes: '',
    },
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description || '',
        sku: product.sku,
        category: product.category,
        brand: product.brand || '',
        cost_price: product.cost_price,
        selling_price: product.selling_price || null,
        stock_quantity: product.stock_quantity,
        min_stock_level: product.min_stock_level,
        max_stock_level: product.max_stock_level || null,
        unit: product.unit,
        is_active: product.is_active,
        notes: product.notes || '',
      });
    } else {
      reset({
        name: '',
        description: '',
        sku: '',
        category: '',
        brand: '',
        cost_price: 0,
        selling_price: null,
        stock_quantity: 0,
        min_stock_level: 5,
        max_stock_level: null,
        unit: 'unidad',
        is_active: true,
        notes: '',
      });
    }
  }, [product, reset]);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1500));
      onSuccess();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ['Esmaltes', 'Herramientas', 'Tratamientos', 'Accesorios', 'Decoración', 'Otro'];
  const units = ['unidad', 'ml', 'gr', 'set', 'caja', 'par'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? 'Editar Producto' : 'Nuevo Producto'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Package className="w-4 h-4" />
              <span>Nombre del producto</span>
            </label>
            <input
              {...register('name')}
              type="text"
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-cyan-100 focus:border-cyan-300 transition-all duration-300"
              placeholder="Ej: Esmalte Gel UV Rosa Pastel"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4" />
              <span>SKU</span>
            </label>
            <input
              {...register('sku')}
              type="text"
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-cyan-100 focus:border-cyan-300 transition-all duration-300"
              placeholder="Ej: ESM-001"
            />
            {errors.sku && (
              <p className="mt-1 text-sm text-red-500">{errors.sku.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>
            <select
              {...register('category')}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-cyan-100 focus:border-cyan-300 transition-all duration-300"
            >
              <option value="">Selecciona una categoría</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Marca (opcional)
            </label>
            <input
              {...register('brand')}
              type="text"
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-cyan-100 focus:border-cyan-300 transition-all duration-300"
              placeholder="Ej: OPI"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4" />
              <span>Precio de costo</span>
            </label>
            <input
              {...register('cost_price')}
              type="number"
              min="0"
              step="100"
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-cyan-100 focus:border-cyan-300 transition-all duration-300"
              placeholder="2500"
            />
            {errors.cost_price && (
              <p className="mt-1 text-sm text-red-500">{errors.cost_price.message}</p>
            )}
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4" />
              <span>Precio de venta (opcional)</span>
            </label>
            <input
              {...register('selling_price')}
              type="number"
              min="0"
              step="100"
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-cyan-100 focus:border-cyan-300 transition-all duration-300"
              placeholder="4000"
            />
          </div>
        </div>

        {/* Stock */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock actual
            </label>
            <input
              {...register('stock_quantity')}
              type="number"
              min="0"
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-cyan-100 focus:border-cyan-300 transition-all duration-300"
              placeholder="10"
            />
            {errors.stock_quantity && (
              <p className="mt-1 text-sm text-red-500">{errors.stock_quantity.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock mínimo
            </label>
            <input
              {...register('min_stock_level')}
              type="number"
              min="0"
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-cyan-100 focus:border-cyan-300 transition-all duration-300"
              placeholder="5"
            />
            {errors.min_stock_level && (
              <p className="mt-1 text-sm text-red-500">{errors.min_stock_level.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock máximo (opcional)
            </label>
            <input
              {...register('max_stock_level')}
              type="number"
              min="0"
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-cyan-100 focus:border-cyan-300 transition-all duration-300"
              placeholder="50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unidad
            </label>
            <select
              {...register('unit')}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-cyan-100 focus:border-cyan-300 transition-all duration-300"
            >
              {units.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
            {errors.unit && (
              <p className="mt-1 text-sm text-red-500">{errors.unit.message}</p>
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
            rows={2}
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-cyan-100 focus:border-cyan-300 transition-all duration-300 resize-none"
            placeholder="Descripción del producto..."
          />
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas (opcional)
          </label>
          <textarea
            {...register('notes')}
            rows={2}
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-cyan-100 focus:border-cyan-300 transition-all duration-300 resize-none"
            placeholder="Notas adicionales sobre el producto..."
          />
        </div>

        {/* Estado */}
        <div className="flex items-center space-x-3">
          <input
            {...register('is_active')}
            type="checkbox"
            className="w-5 h-5 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
          />
          <label className="text-sm font-medium text-gray-700">
            Producto activo
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
            className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{product ? 'Actualizar' : 'Crear'} Producto</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};