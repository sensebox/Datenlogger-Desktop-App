import { DataTable } from "@/components/data-table";
import { UploadDialog } from "@/components/upload-dialog";
import { File, getColumns } from "@/lib/columns/files";
import { readDirectory } from "@/lib/fs";
import { Upload } from "@/styles/types";
import { invoke } from "@tauri-apps/api";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/components/ui/use-toast";
import storage from "@/lib/local-storage";
import LoadingOverlay from "@/components/ui/LoadingOverlay";

export default function Folder() {
  let params = useParams();

  const [data, setData] = useState<File[]>([]);
  // use counter to trigger re-render of data table
  const [counter, setCounter] = useState<number>(0);
  const [accessToken, setAccessToken] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const { signInResponse } = useAuth();
  const { toast } = useToast();
  useEffect(() => {
    const readDir = async () => {
      const uploadedFiles: Upload[] = await invoke("get_data", {
        device: params.folderId,
      });
      const files = await readDirectory(`.reedu/data/${params.folderId}`);
      const mappedFiles: File[] = [];
      for (let index = 0; index < files.length; index++) {
        const element = files[index];
        const fileIsUploaded = uploadedFiles.findIndex(
          (uploadedFile) => uploadedFile.filename === element.name
        );
        mappedFiles.push({
          filename: element.name || "no name",
          size: "",
          status: fileIsUploaded >= 0 ? "uploaded" : "pending",
        });
      }
      setData(mappedFiles);
    };
    readDir();
  }, [params, counter, accessToken]);

  useEffect(() => {
    const fetchDeviceSecret = async (deviceId: string) => {
      setLoading(true);
      console.log("token from api");
      const response = await fetch(
        `https://api.opensensemap.org/users/me/boxes/${deviceId}`,
        {
          headers: {
            Authorization: `Bearer ${signInResponse?.token}`,
          },
        }
      );
      const answer = await response.json();
      if (
        answer.code === "BadRequest" ||
        answer.code === "UnprocessableEntity" ||
        answer.code === "Unauthorized" ||
        answer.code === "Forbidden"
      ) {
        toast({
          variant: "destructive",
          title: answer.code,
          description: answer.message,
          duration: 5000,
        });
      } else {
        setAccessToken(answer.data.box.access_token);
        storage.set(`accessToken_${deviceId}`, answer.data.box.access_token);
      }
      setLoading(false);
    };

    if (params.folderId && !storage.get(`accessToken_${params.folderId}`)) {
      fetchDeviceSecret(params.folderId);
    }
  }, [params]);

  const columns = getColumns(
    [],
    [
      {
        id: "actions",
        cell: ({ row }: any) => {
          return (
            <UploadDialog
              filename={row.original.filename}
              deviceId={params.folderId || ""}
              setCounter={setCounter}
            />
          );
        },
      },
    ]
  );

  return (
    <div>
      {loading && <LoadingOverlay />}
      <DataTable columns={columns} data={data} />
    </div>
  );
}
