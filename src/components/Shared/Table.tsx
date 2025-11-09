import { ReactNode } from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  render?: (value: any, row: T) => ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
}

export default function Table<T extends { id: number }>({ columns, data, onRowClick }: TableProps<T>) {
  const renderCell = (column: Column<T>, row: T) => {
    if (typeof column.accessor === 'function') {
      return column.accessor(row);
    }
    const value = row[column.accessor as keyof T];
    if (column.render) {
      return column.render(value, row);
    }
    return value !== null && value !== undefined ? String(value) : '-';
  };

  return (
    <div className="overflow-x-auto -mx-4 md:mx-0">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {!data || data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-400 text-sm">
                No data available
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-gray-100 ${
                  onRowClick ? 'hover:bg-blue-50 cursor-pointer transition-colors' : 'hover:bg-gray-50'
                }`}
              >
                {columns.map((column, index) => (
                  <td key={index} className="px-3 md:px-4 py-2.5 md:py-3.5 whitespace-nowrap text-sm text-gray-900">
                    {renderCell(column, row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
