import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Delete, Save } from "lucide-react";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type File = {
  filename: string;
  size: string;
  status: "pending" | "processing" | "success" | "failed";
};

export const columns: ColumnDef<File>[] = [
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
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex gap-4">
          <Button onClick={() => console.log("tbd")}>
            <Save className="mr-2 h-4 w-4" /> Copy
          </Button>
          <Button onClick={() => console.log("tbd")}>
            <Delete className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      );
    },
  },
];
