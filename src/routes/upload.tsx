import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { readDirectory } from "@/lib/fs";
// import { UploadDialog } from "@/components/upload-dialog";
import { cn } from "@/lib/utils";
import { FileEntry } from "@tauri-apps/api/fs";
import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";

export default function Upload() {
  const [data, setData] = React.useState<FileEntry[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<FileEntry>();
  const [folders, setFolders] = React.useState<FileEntry[]>([]);

  React.useEffect(() => {
    const readDir = async () => {
      const fileEntries = await readDirectory(".reedu/data", false);
      console.log(fileEntries);
      setFolders(fileEntries);
    };

    readDir();
  }, []);

  const columns = React.useMemo(
    () => [
      {
        Header: "Filename",
        accessor: "name", // accessor is the "key" in the data
      },
      {
        Header: "Size",
        accessor: "size",
      },
      {
        Header: "Status",
        accessor: "status",
      },
      {
        Header: "Action",
        accessor: "action",
        Cell: ({ cell }) => <UploadDialog filename={cell.row.values.name} />,
      },
    ],
    []
  );

  const onFolderClick = async (fileEntry: FileEntry) => {
    const files = await readDirectory(`devices/${fileEntry.name}`);
    setSelectedFolder(fileEntry);
    setData(files);
  };

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
                {folders.map((folder) => (
                  <React.Fragment>
                    <Link to={`/upload/${folder.name}`}>{folder.name}</Link>
                    <Separator className="my-2" />
                  </React.Fragment>
                ))}
              </div>
            </ScrollArea>
            <div className="col-span-3">
              <Outlet />
            </div>
            {/* {selectedFolder ? (
              <div className="col-span-3">
                <Table columns={columns} data={data} />
              </div>
            ) : (
              <div className="col-span-3">
                <div className="flex h-full w-full items-center justify-center rounded-md border border-dashed text-sm">
                  <h1>Please select a folder on the left side</h1>
                </div>
              </div>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
}
