import { useState } from "react";
import EditconfigForm from "./EditConfigForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { CogIcon, SettingsIcon } from "lucide-react";

export function EditConfigDialog({})  {
    const [open, setOpen] = useState<boolean>(false);

    return(
        <Dialog
            open={open}
            onOpenChange={setOpen}
        >   
        <DialogTrigger asChild>
            <Button
            className="w-1/2"
                >
                    <SettingsIcon className="h-5 w-5 mr-2" />
                    Config Datei ändern
                </Button>
        </DialogTrigger>
        <DialogTitle className="hidden">
            
        </DialogTitle>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
            <EditconfigForm setModal={setOpen} />
        </DialogContent>
        </Dialog>

    )
}

