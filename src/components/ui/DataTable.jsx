import React from 'react';
import { PlusCircle, Trash2, Edit2 } from 'lucide-react';

const DataTable = ({ 
  title,
  headers, 
  data, 
  onEdit,
  onDelete,
  emptyMessage = "No data available",
  actions = true,
  sortButton,
  children
}) => {
  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      {(title || sortButton) && (
        <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
          {title && <h3 className="font-semibold text-gray-700">{title}</h3>}
          {sortButton && sortButton}
        </div>
      )}
      
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            {headers.map((header, index) => (
              <th 
                key={index} 
                className={`p-4 font-semibold text-gray-700 ${
                  header.align === 'right' ? 'text-right' : 
                  header.align === 'center' ? 'text-center' : 'text-left'
                } ${header.width || ''}`}
              >
                {header.label}
              </th>
            ))}
            {actions && <th className="w-32 text-center p-4 font-semibold text-gray-700">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={headers.length + (actions ? 1 : 0)} className="p-8 text-center text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={row.id || rowIndex} className="border-b hover:bg-gray-50">
                {headers.map((header, colIndex) => (
                  <td 
                    key={colIndex} 
                    className={`p-4 ${
                      header.align === 'right' ? 'text-right' : 
                      header.align === 'center' ? 'text-center' : 'text-left'
                    } ${header.className || ''}`}
                  >
                    {header.render ? header.render(row) : row[header.key]}
                  </td>
                ))}
                {actions && (
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {children}
    </div>
  );
};

export default DataTable;