import React, { useMemo } from 'react';
import { DayPicker } from 'react-day-picker';
import type { Matcher } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { es } from 'date-fns/locale';

interface CustomDatePickerProps {
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  daysDisabled?: Date[];
}

const WEEKDAYS = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ selected, onSelect, daysDisabled }) => {
  // Deshabilitar domingos y fechas específicas
  const disabledDays: Matcher[] = [
    { dayOfWeek: [0] },
    ...(daysDisabled || [])
  ];

  // Calcular mes y año actual para el header
  const monthLabel = useMemo(() => {
    if (!selected) return '';
    return selected.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
  }, [selected]);

  // Custom render: solo lunes a sábado
  return (
    <div className="bg-white rounded-2xl shadow-md p-4">
      <div className="text-center mb-4">
        <span className="text-2xl font-bold text-pink-600 capitalize tracking-wide">
          {monthLabel || new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              {WEEKDAYS.map((wd) => (
                <th key={wd} className="py-1 text-xs font-semibold text-pink-500 text-center">
                  {wd}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Renderizar las semanas del mes, solo lunes a sábado */}
            {(() => {
              // Obtener el primer día del mes mostrado
              const baseDate = selected || new Date();
              const year = baseDate.getFullYear();
              const month = baseDate.getMonth();
              const firstDay = new Date(year, month, 1);
              // Calcular el primer lunes del mes (o el primer día si ya es lunes)
              let start = new Date(firstDay);
              while (start.getDay() !== 1) {
                start.setDate(start.getDate() - 1);
              }
              // Generar las semanas (máximo 6)
              const weeks = [];
              for (let w = 0; w < 6; w++) {
                const days = [];
                for (let d = 1; d <= 6; d++) {
                  const day = new Date(start);
                  day.setDate(start.getDate() + w * 7 + (d - 1));
                  // Solo mostrar días del mes actual
                  const isCurrentMonth = day.getMonth() === month;
                  // Deshabilitar domingos y días fuera del mes
                  const isDisabled =
                    day.getDay() === 0 ||
                    !isCurrentMonth ||
                    disabledDays.some((matcher) => {
                      if (typeof matcher === 'function') return matcher(day);
                      if (matcher instanceof Date) return day.toDateString() === matcher.toDateString();
                      if (matcher && typeof matcher === 'object' && 'dayOfWeek' in matcher && Array.isArray(matcher.dayOfWeek)) {
                        return matcher.dayOfWeek.includes(day.getDay());
                      }
                      return false;
                    });
                  const isSelected = selected && day.toDateString() === selected.toDateString();
                  const isToday = day.toDateString() === new Date().toDateString();
                  days.push(
                    <td key={d} className="p-0 text-center">
                      <button
                        type="button"
                        disabled={isDisabled}
                        onClick={() => onSelect(day)}
                        className={`w-10 h-10 rounded-xl font-medium transition-all duration-200
                          ${isSelected ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow' : ''}
                          ${isToday && !isSelected ? 'border border-pink-400' : ''}
                          ${isDisabled ? 'text-gray-300 line-through cursor-not-allowed bg-gray-50' : 'hover:bg-pink-50'}
                        `}
                        tabIndex={isDisabled ? -1 : 0}
                      >
                        {isCurrentMonth ? day.getDate() : ''}
                      </button>
                    </td>
                  );
                }
                weeks.push(<tr key={w}>{days}</tr>);
              }
              return weeks;
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 