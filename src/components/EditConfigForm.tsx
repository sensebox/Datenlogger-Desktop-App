import React, { useState, useEffect } from "react";
import { useBoardStore } from "@/lib/store/board";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useAuth } from "./auth-provider";
import { Cpu } from "lucide-react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

type EditConfigFormProps = {
  setConfigModalOpen: (open: boolean) => void;
};

const EditconfigForm = ({ setConfigModalOpen }: EditConfigFormProps) => {
  const { config } = useBoardStore();
  const { signInResponse } = useAuth();
  const [boxes, setBoxes] = useState<any[]>([]);
  const [selectedBox, setSelectedBox] = useState<string>(
    config?.sensebox_id ?? ""
  );

  // Beim Mount der Komponente die gespeicherte Konfiguration aus dem Storage abrufen
  useEffect(() => {
    const storedconfig = localStorage.getItem("senseboxconfig");
    if (storedconfig) {
      // setconfig(JSON.parse(storedconfig));
    }
    const boxes = signInResponse?.data?.user?.boxes ?? [];
    setBoxes(boxes);
  }, []);

  // Funktion, um die Werte im State zu aktualisieren
  const handleChange = (e: string) => {
    setSelectedBox(e);
  };

  // Funktion zum Speichern der geänderten Konfiguration
  const handleSubmit = (e: React.FormEvent) => {
    console.log(setConfigModalOpen);
    setConfigModalOpen(false);
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-lg w-full mx-auto h-[70vh] flex flex-col">
      <div className="mb-2">
        <h1 className="text-xl text-green-600">senseBox Konfiguration</h1>
        <p className="text-sm text-gray-700">
          Ändere die Konfiguration der senseBox. Die Änderungen werden auf der
          SD-Karte der senseBox gespeichert.
        </p>
      </div>

      <div className="flex-grow overflow-y-auto bg-white p-3 rounded-lg shadow max-h-80">
        <Label> senseBox ID</Label>

        <Select onValueChange={(e) => handleChange(e)}>
          <SelectTrigger>
            <SelectValue>
              <span className="flex flex-row items-center">
                <Cpu className="h-5 w-5 p-1" />
                {selectedBox}
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {boxes.map((box: any) => (
              <SelectItem
                key={box}
                value={box}
                className="hover:bg-green-100 transition flex flex-row"
              >
                <div className="flex flex-row">
                  <Cpu className="h-5 w-5 p-1" />
                  <span className="">{box}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <div className="flex flex-row gap-4">
          <div>
            <Label> Name</Label>
            <Input disabled={true} value={config?.temp_id} />
          </div>
        </div>
        <div className="flex flex-row gap-4">
          <div>
            <Label> TemperatursensorID</Label>
            <Input disabled={true} value={config?.temp_id} />
          </div>
          <div>
            <Label> Humi Sensor ID</Label>
            <Input disabled={true} value={config?.temp_id} />
          </div>
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        className="mt-2 w-full bg-green-600 text-white p-1 rounded-lg hover:bg-green-700 transition text-sm"
      >
        Speichern
      </Button>
    </div>
  );
};

export default EditconfigForm;
