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
import { CogIcon } from "lucide-react";

export function EditConfigDialog({})  {
    const [open, setOpen] = useState<boolean>(false);

    return(
        <Dialog
            open={open}
            onOpenChange={setOpen}
        >   
        <DialogTrigger asChild>
            <Button
            className="w-full"
                >
                    <CogIcon className="h-5 w-5 mr-2" />
                Konfiguration bearbeiten
                </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
            <EditconfigForm setModal={setOpen} />
        </DialogContent>
        </Dialog>

    )
}

