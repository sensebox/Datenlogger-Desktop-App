import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { readDirectory } from "@/lib/fs";
import { FileEntry } from "@tauri-apps/api/fs";
import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { invoke } from "@tauri-apps/api/tauri";
import { useAuth } from "@/components/auth-provider";

export default function Upload() {
  const [folders, setFolders] = useState<FileEntry[]>([]);
  const { signInResponse } = useAuth();

  useEffect(() => {
    const readDir = async () => {
      const fileEntries = await readDirectory(".reedu/data", false);
      setFolders(fileEntries);
    };

    readDir();
  }, []);

  const openInExplorer = async () => {
    await invoke("open_in_explorer");
  };

  return (
    <div className="container">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Devices</h2>
          <Button
            onClick={() => {
              openInExplorer();
            }}
          >
            <ExternalLink className="ml-auto h-4 w-4 m-1" />
            Open data folder
          </Button>
        </div>
        <div className="space-y-4">
          <div className="flex flex-row gap-4 justify-between ">
            <ScrollArea className=" h-72 rounded-md border">
              <div className="p-4">
                <h4 className="mb-4 text-xs font-medium leading-none">
                  Device folders
                </h4>
                {folders.map((folder, index) => {
                  const isRegistered = signInResponse?.data?.user.boxes.includes(
                    folder.name
                  );
                  return (
                    <div
                      key={index}
                      id={folder.name}
                      className={`p-3 mb-2 rounded-md border cursor-pointer ${
                        isRegistered
                          ? "bg-green-100 hover:bg-green-200"
                          : "bg-red-100 hover:bg-red-200"
                      } transition duration-200 ease-in-out`}
                    >
                      {isRegistered ? (
                        <Link
                          to={`/upload/${folder.name}`}
                          className="text-blue-600 hover:underline"
                        >
                          {folder.name}
                        </Link>
                      ) : (
                        <span className="text-gray-500">
                          {folder.name} (not registered to this Account)
                        </span>
                      )}
                      <Separator className="my-2" />
                    </div>
                  );
                })}
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
