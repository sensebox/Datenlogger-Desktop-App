import { Button } from "@/components/ui/button";
import { UploadDialog } from "@/components/upload-dialog";
import { FileContent } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { invoke } from "@tauri-apps/api";
import { FileEntry } from "@tauri-apps/api/fs";
import { Delete, Save } from "lucide-react";

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
