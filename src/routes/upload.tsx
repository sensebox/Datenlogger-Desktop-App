import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { readDirectory } from "@/lib/fs";
import { FileEntry } from "@tauri-apps/api/fs";
import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";

export default function Upload() {
  const [folders, setFolders] = useState<FileEntry[]>([]);

  useEffect(() => {
    const readDir = async () => {
      const fileEntries = await readDirectory(".reedu/data", false);
      setFolders(fileEntries);
    };

    readDir();
  }, []);

  return (
    <div className="container">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Devices</h2>
        </div>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <ScrollArea className="col-span-1 h-72 rounded-md border">
              <div className="p-4">
                <h4 className="mb-4 text-sm font-medium leading-none">
                  Device folders
                </h4>
                {folders.map((folder, index) => (
                  <div key={index} id={folder.name}>
                    <Link to={`/upload/${folder.name}`}>{folder.name}</Link>
                    <Separator className="my-2" />
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="col-span-3">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
