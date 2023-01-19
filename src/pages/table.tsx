import type { ColumnDef } from "@tanstack/react-table";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useReducer, useState } from "react";

type Animal = {
  name: string;
  species: string;
  age: number;
};

const defaultData: Animal[] = [
  {
    name: "tanner",
    species: "dog",
    age: 8,
  },
  {
    name: "molly",
    species: "giraffe",
    age: 40,
  },
  {
    name: "alice",
    species: "unicorn",
    age: 754,
  },
];

type C<T> = ColumnDef<Animal, T>;

const columns: (C<string> | C<number>)[] = [
  {
    id: "name",
    accessorKey: "name",
  },
  {
    id: "species",
    accessorKey: "species",
  },
  {
    id: "age",
    accessorKey: "age",
  },
];

export default function Table() {
  const [data, setData] = useState(() => [...defaultData]);
  const rerender = useReducer(() => ({}), {})[1];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  console.log("rendering");

  const updateData = () => {
    console.log("updateData");
    setData([
      defaultData[0]!,
      {
        name: "molly",
        species: "giraffe",
        age: 40,
      },
      defaultData[1]!,
    ]);
  };

  return (
    <div className="p-2">
      <table className="table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="border-collapse">
          {table.getRowModel().rows.map((row) => {
            return (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  console.log(`rendering row ${row.id} cell ${cell.id}`);
                  return (
                    <td key={cell.id} className="border">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          {table.getFooterGroups().map((footerGroup) => (
            <tr key={footerGroup.id}>
              {footerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.footer, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </tfoot>
      </table>
      <div className="h-4" />
      <div className="flex flex-row gap-2">
        <button onClick={() => rerender()} className="border px-4 py-2 rounded-full bg-violet-200">
          Rerender
        </button>
        <button onClick={() => updateData()} className="border px-4 py-2 rounded-full bg-violet-200">
          Update Data
        </button>
      </div>
    </div>
  );
}
