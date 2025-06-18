import { DownloadIcon } from "@radix-ui/react-icons";
import { Button } from "./ui/button";
import { UploadAllDialog } from "./upload-all-dialog";
import { HelpCircleIcon, Trash } from "lucide-react";
import { Tooltip } from "@radix-ui/react-tooltip";
import { TooltipTrigger } from "./ui/tooltip";
import { Link } from "react-router-dom";

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
        Alles auf der Festplatte speichern
      </Button>
      <UploadAllDialog
        disabled={data.length === 0}
        //@ts-ignore
        files={data}
        deviceId={config?.sensebox_id}
      />
      <Link
        to="/help"
        >
          <Button
            variant={"outline"}
            className="w-full"
            >
                            <HelpCircleIcon className="mr-2 h-4 w-4   " />

            Hilfe
            </Button>
        </Link>

      {/* <Button
        onClick={() => deleteAllFiles()}
        disabled={true}
        variant={"destructive"}
      >
        <Trash className="mr-2 h-4 w-4  text-white" />
        Gerätespeicher leeren
      </Button> */}
    </div>
  );
};
