import { DownloadIcon } from "@radix-ui/react-icons";
import { Button } from "./ui/button";
import { UploadAllDialog } from "./upload-all-dialog";
import { Trash } from "lucide-react";

interface SDCardTableButtonBarProps {
  data: any[];
  config: { name?: string; sensebox_id?: string } | null;
  downloadAllFiles: () => void;
  deleteAllFiles: () => void;
}

export const SDCardTableButtonBar = ({
  data,
  config,
  downloadAllFiles,
  deleteAllFiles,
}: SDCardTableButtonBarProps) => {
  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={() => downloadAllFiles()}
        disabled={data.length === 0}
        className="mt-4 bg-blue-500"
      >
        <DownloadIcon className="mr-2 h-4 w-4  text-white" />
        Alle Daten runterladen
      </Button>
      <UploadAllDialog
        disabled={data.length === 0}
        files={data}
        deviceId={config?.sensebox_id}
      />
      <Button
        onClick={() => deleteAllFiles()}
        disabled={data.length === 0}
        variant={"destructive"}
      >
        <Trash className="mr-2 h-4 w-4  text-white" />
        Alle Daten löschen
      </Button>
    </div>
  );
};
