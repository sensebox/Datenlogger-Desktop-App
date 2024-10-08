import React, { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Label } from "@/components/ui/label";
import { useBoardStore } from "@/lib/store/board";
import { Button } from "./ui/button";

// TypeScript Interface für Senseboxconfig
type Senseboxconfig = {
  name: string;
  sensebox_id: string;
  ssid?: string;
  psk?: string;
  temp_id?: string;
  humi_id?: string;
  dist_l_id?: string;
  dist_r_id?: string;
  pm10_id?: string;
  pm25_id?: string;
  acc_x_id?: string;
  acc_y_id?: string;
  acc_z_id?: string;
  speed_id?: string;
};

const EditconfigForm = () => {
  const { config } = useBoardStore();

  // Beim Mount der Komponente die gespeicherte Konfiguration aus dem Storage abrufen
  useEffect(() => {
    const storedconfig = localStorage.getItem("senseboxconfig");
    if (storedconfig) {
      //   setconfig(JSON.parse(storedconfig));
    }
  }, []);

  // Funktion, um die Werte im State zu aktualisieren
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // setconfig((prevconfig) => ({
    //   ...prevconfig,
    //   [name]: value,
    // }));
  };

  // Funktion zum Speichern der geänderten Konfiguration
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Die geänderte Konfiguration in den localStorage speichern
    localStorage.setItem("senseboxconfig", JSON.stringify(config));
    alert("Konfiguration wurde gespeichert!");
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
        <form onSubmit={handleSubmit} className="space-y-3">
          {config?.name && config.name.trim() !== "" && (
            <div>
              <Label className="block text-sm text-green-600">Name:</Label>
              <Input
                type="text"
                name="name"
                value={config.name}
                onChange={handleChange}
                className="mt-1 p-1 w-full border border-green-300 rounded text-sm"
                required
              />
            </div>
          )}

          {config?.sensebox_id && config.sensebox_id.trim() !== "" && (
            <div>
              <Label className="block text-sm text-green-600">
                Sensebox ID:
              </Label>
              <Input
                type="text"
                name="sensebox_id"
                value={config.sensebox_id}
                onChange={handleChange}
                className="mt-1 p-1 w-full border border-green-300 rounded text-sm"
                required
              />
            </div>
          )}

          {config?.ssid && config.ssid.trim() !== "" && (
            <div>
              <Label className="block text-sm text-green-600">SSID:</Label>
              <Input
                type="text"
                name="ssid"
                value={config.ssid}
                onChange={handleChange}
                className="mt-1 p-1 w-full border border-green-300 rounded text-sm"
              />
            </div>
          )}

          {config?.psk && config.psk.trim() !== "" && (
            <div>
              <Label className="block text-sm text-green-600">PSK:</Label>
              <Input
                type="text"
                name="psk"
                value={config.psk}
                onChange={handleChange}
                className="mt-1 p-1 w-full border border-green-300 rounded text-sm"
              />
            </div>
          )}

          {config?.temp_id && config.temp_id.trim() !== "" && (
            <div>
              <Label className="block text-sm text-green-600">Temp ID:</Label>
              <Input
                type="text"
                name="temp_id"
                value={config.temp_id}
                onChange={handleChange}
                className="mt-1 p-1 w-full border border-green-300 rounded text-sm"
              />
            </div>
          )}

          {config?.humi_id && config.humi_id.trim() !== "" && (
            <div>
              <Label className="block text-sm text-green-600">Humi ID:</Label>
              <Input
                type="text"
                name="humi_id"
                value={config.humi_id}
                onChange={handleChange}
                className="mt-1 p-1 w-full border border-green-300 rounded text-sm"
              />
            </div>
          )}

          {config?.dist_l_id && config.dist_l_id.trim() !== "" && (
            <div>
              <Label className="block text-sm text-green-600">Dist L ID:</Label>
              <Input
                type="text"
                name="dist_l_id"
                value={config.dist_l_id}
                onChange={handleChange}
                className="mt-1 p-1 w-full border border-green-300 rounded text-sm"
              />
            </div>
          )}

          {config?.dist_r_id && config.dist_r_id.trim() !== "" && (
            <div>
              <Label className="block text-sm text-green-600">Dist R ID:</Label>
              <Input
                type="text"
                name="dist_r_id"
                value={config.dist_r_id}
                onChange={handleChange}
                className="mt-1 p-1 w-full border border-green-300 rounded text-sm"
              />
            </div>
          )}

          {config?.pm10_id && config.pm10_id.trim() !== "" && (
            <div>
              <Label className="block text-sm text-green-600">PM10 ID:</Label>
              <Input
                type="text"
                name="pm10_id"
                value={config.pm10_id}
                onChange={handleChange}
                className="mt-1 p-1 w-full border border-green-300 rounded text-sm"
              />
            </div>
          )}

          {config?.pm25_id && config.pm25_id.trim() !== "" && (
            <div>
              <Label className="block text-sm text-green-600">PM2.5 ID:</Label>
              <Input
                type="text"
                name="pm25_id"
                value={config.pm25_id}
                onChange={handleChange}
                className="mt-1 p-1 w-full border border-green-300 rounded text-sm"
              />
            </div>
          )}

          {config?.acc_x_id && config.acc_x_id.trim() !== "" && (
            <div>
              <Label className="block text-sm text-green-600">ACC X ID:</Label>
              <Input
                type="text"
                name="acc_x_id"
                value={config.acc_x_id}
                onChange={handleChange}
                className="mt-1 p-1 w-full border border-green-300 rounded text-sm"
              />
            </div>
          )}

          {config?.acc_y_id && config.acc_y_id.trim() !== "" && (
            <div>
              <Label className="block text-sm text-green-600">ACC Y ID:</Label>
              <Input
                type="text"
                name="acc_y_id"
                value={config.acc_y_id}
                onChange={handleChange}
                className="mt-1 p-1 w-full border border-green-300 rounded text-sm"
              />
            </div>
          )}

          {config?.acc_z_id && config.acc_z_id.trim() !== "" && (
            <div>
              <Label className="block text-sm text-green-600">ACC Z ID:</Label>
              <Input
                type="text"
                name="acc_z_id"
                value={config.acc_z_id}
                onChange={handleChange}
                className="mt-1 p-1 w-full border border-green-300 rounded text-sm"
              />
            </div>
          )}

          {config?.speed_id && config.speed_id.trim() !== "" && (
            <div>
              <Label className="block text-sm text-green-600">Speed ID:</Label>
              <Input
                type="text"
                name="speed_id"
                value={config.speed_id}
                onChange={handleChange}
                className="mt-1 p-1 w-full border border-green-300 rounded text-sm"
              />
            </div>
          )}
        </form>
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
