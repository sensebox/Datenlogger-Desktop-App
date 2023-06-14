import { Button } from "@/components/ui/button";
import { UploadDialog } from "@/components/upload-dialog";
import { ColumnDef } from "@tanstack/react-table";
import { FileEntry } from "@tauri-apps/api/fs";
import { ArrowUpDown } from "lucide-react";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type File = {
  filename: string;
  size: string;
  status: "pending" | "synced";
};

export type FileUpload = {
  name: string;
  size: string;
  status: "pending" | "synced";
};

export const getColumns = (columns: any, actions: any): ColumnDef<File>[] => {
  return [
    {
      accessorKey: "filename",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Filename
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "size",
      header: "Size (Bytes)",
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    ...columns,
    ...actions,
  ];
};

export const uploadColumns: ColumnDef<FileEntry>[] = [
  {
    accessorKey: "name",
    header: "Filename",
  },
  {
    accessorKey: "size",
    header: "Size (Bytes)",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    id: "actions",
    cell: ({ cell }) => <UploadDialog filename={"Tets"} />,
  },
];
