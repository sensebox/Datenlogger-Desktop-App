import { DataTable } from "@/components/data-table";
import { UploadDialog } from "@/components/upload-dialog";
import { File, getColumns } from "@/lib/columns/files";
import { readDirectory } from "@/lib/fs";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function Folder() {
  let params = useParams();

  const [data, setData] = useState<File[]>([]);

  useEffect(() => {
    const readDir = async () => {
      const files = await readDirectory(`.reedu/data/${params.folderId}`);
      const mappedFiles: File[] = [];
      for (let index = 0; index < files.length; index++) {
        const element = files[index];
        mappedFiles.push({
          filename: element.name || "no name",
          size: "",
          status: "pending",
        });
      }
      setData(mappedFiles);
    };

    readDir();
  }, [params]);

  const columns = getColumns(
    [],
    [
      {
        id: "actions",
        cell: ({ row }) => {
          return (
            <UploadDialog
              filename={row.original.filename}
              deviceId={params.folderId || ""}
            />
          );
        },
      },
    ]
  );

  return <DataTable columns={columns} data={data} />;
}
