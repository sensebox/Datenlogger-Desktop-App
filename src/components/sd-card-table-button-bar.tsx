import { DownloadIcon } from "@radix-ui/react-icons";
import { Button } from "./ui/button";
import { UploadAllDialog } from "./upload-all-dialog";
import { FolderIcon, HelpCircleIcon, Trash } from "lucide-react";
import { Tooltip } from "@radix-ui/react-tooltip";
import { TooltipTrigger } from "./ui/tooltip";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { invoke } from "@tauri-apps/api/tauri";
import EditconfigForm from "./EditConfigForm";
import { EditConfigDialog } from "./edit-config-dialog";

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

    const openFolderInExplorer = async () => {
    try {
      await invoke("open_in_explorer", {
        deviceid: config?.sensebox_id,
      });
    } catch (error: any) {
      toast.error(
        `Fehler beim Öffnen des Ordners: ${error.message}`
      );
    }
  };
  return (
  

    <div className="flex-col w-full  ">
            {/* Primäre Aktionen */}
            <div className="flex flex-col items-center gap-2">

            <Button
              onClick={downloadAllFiles}
              className="w-1/2"
              style={{ backgroundColor: "#3B82F6" /* bg-blue-500 */ }}
            >
              <DownloadIcon className="h-5 w-5 mr-2" />
              Alles speichern
            </Button>
      <UploadAllDialog
        disabled={data.length === 0}
        //@ts-ignore
        files={data}
        deviceId={config?.sensebox_id}
      />
            </div>

      <div className=" mt-4 border-t border-gray-200 pt-3" />

      {/* Sekundäre Aktionen */}
      <div className="flex flex-col gap-2 items-center">

      <Button
        onClick={openFolderInExplorer}
        className="w-1/2" 
        variant="secondary"
        style={{ backgroundColor: "#FBBF24" /* bg-yellow-400 */ }}
      >
        <FolderIcon className="h-5 w-5 mr-2" />
        Ordner öffnen
      </Button>
      <EditConfigDialog />
      <Button 
        variant={"outline"}
        className="w-1/2"
        asChild>
        <Link to="/help">
                  <HelpCircleIcon className="mr-2 h-4 w-4   " />
          Hilfe

        </Link>
      </Button>
      </div>

      </div>
  );
};
