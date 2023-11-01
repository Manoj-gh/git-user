"use client";

import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ToggleSwitch } from "@contentstack/venus-components";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type LocaleInfo = {
  code: string;
  locale: string;
  checked: boolean;
};

interface ColumnsProps {
  checkedLocales: Record<string, boolean>;
  setCheckedLocales: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  setCheckedReferences: React.Dispatch<
    React.SetStateAction<Record<string, Record<string, boolean>>>
  >;
}

export const columns = ({
  checkedLocales,
  setCheckedLocales,
  setCheckedReferences,
}: ColumnsProps): ColumnDef<LocaleInfo>[] => {
  return [
    {
      accessorKey: "locale",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Locale
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "code",
      header: "Code",
    },
    {
      id: "checked",
      header: ({ table }) => (
        <ToggleSwitch
          checked={
            table.getIsAllPageRowsSelected() ||
            Object.values(checkedLocales).every((v) => v)
          }
          onChange={({ target: { checked } }: any) => {
            table.toggleAllPageRowsSelected(!!checked);
            setCheckedLocales((prev) => {
              const newCheckedLocales = { ...prev };
              Object.keys(newCheckedLocales).forEach((key) => {
                newCheckedLocales[key] = !!checked;
              });
              return newCheckedLocales;
            });
            setCheckedReferences((prev) => {
              const newCheckedReferences = { ...prev };
              Object.keys(newCheckedReferences).forEach((key) => {
                newCheckedReferences[key] = {
                  ...newCheckedReferences[key],
                  ...Object.keys(newCheckedReferences[key]).reduce(
                    (acc, curr) => {
                      acc[curr] = !!checked;
                      return acc;
                    },
                    {} as Record<string, boolean>
                  ),
                };
              });
              return newCheckedReferences;
            });
          }}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <ToggleSwitch
          checked={checkedLocales[row.original.code]}
          onChange={({ target: { checked } }: any) => {
            row.toggleSelected(!!checked);
            setCheckedLocales((prev) => {
              const newCheckedLocales = { ...prev };
              newCheckedLocales[row.original.code] = !!checked;
              return newCheckedLocales;
            });
            setCheckedReferences((prev) => {
              const newCheckedReferences = { ...prev };
              newCheckedReferences[row.original.code] = {
                ...newCheckedReferences[row.original.code],
                ...Object.keys(newCheckedReferences[row.original.code]).reduce(
                  (acc, curr) => {
                    acc[curr] = !!checked;
                    return acc;
                  },
                  {} as Record<string, boolean>
                ),
              };
              return newCheckedReferences;
            });
          }}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
};
