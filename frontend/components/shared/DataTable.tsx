import React from "react";
import Card from "@/components/ui/Card";

type Column<T> = {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
};

export default function DataTable<T extends { id?: string | number }>({
  title,
  columns,
  rows,
  emptyText = "Nenhum registro encontrado.",
}: {
  title?: string;
  columns: Column<T>[];
  rows: T[];
  emptyText?: string;
}) {
  return (
    <Card className="overflow-hidden">
      {title ? (
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-slate-900">{title}</h3>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              {columns.map((c) => (
                <th key={c.header} className={`text-left font-medium px-6 py-3 ${c.className ?? ""}`}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-10 text-center text-gray-500">
                  {emptyText}
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr key={(row.id ?? idx) as any} className="hover:bg-gray-50">
                  {columns.map((c) => (
                    <td key={String(c.key)} className="px-6 py-4 text-slate-700">
                      {c.render ? c.render(row) : (row as any)[c.key as any]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
