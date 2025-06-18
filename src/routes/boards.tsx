import { useBoardStore } from "@/lib/store/board";
import { useEffect, useState } from "react";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import { useFileStore } from "@/lib/store/files";
import SDCardOverview from "@/components/sd-card-overview";

export default function Boards() {

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
