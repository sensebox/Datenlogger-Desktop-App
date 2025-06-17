import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBoardStore } from "@/lib/store/board";
import { FileContent } from "@/types";
import { invoke } from "@tauri-apps/api/tauri";
import {
  Bot,
  Cpu,
  Delete,
  Fingerprint,
  RefreshCcw,
  Save,
  TrashIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { File, getColumns } from "@/lib/columns/files";
import { useToast } from "@/components/ui/use-toast";
import { readDirectory } from "@/lib/fs";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import { useFileStore } from "@/lib/store/files";
import SDCardOverview from "@/components/sd-card-overview";

export default function Boards() {
  const { toast } = useToast();

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { config, serialPort } = useBoardStore();
  const [disabledButtons, setDisabledButtons] = useState<boolean>(true);
  const { files, setFiles } = useFileStore();

  useEffect(() => {
    serialPort ? setDisabledButtons(false) : setDisabledButtons(true);
  }, [serialPort]);

  useEffect(() => {
    if (files.length > 0) {
      setData(files);
    }
  }, []);

  return (
    <div className="">
      <SDCardOverview />
      {loading && <LoadingOverlay />}
    </div>
  );
}
