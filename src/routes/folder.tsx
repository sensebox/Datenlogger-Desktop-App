import { DataTable } from "@/components/data-table";
import { uploadColumns } from "@/lib/columns/files";
import { readDirectory } from "@/lib/fs";
import { FileEntry } from "@tauri-apps/api/fs";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function Folder() {
  let params = useParams();

  const [folders, setFolders] = useState<FileEntry[]>([]);
  const [data, setData] = useState<FileEntry[]>([]);

  useEffect(() => {
    const readDir = async () => {
      const files = await readDirectory(`.reedu/data/${params.folderId}`);
      console.log(files);
      setData(files);
    };

    readDir();
  }, [params]);

  return <DataTable columns={uploadColumns} data={data} />;
}
