import React, { useState } from "react"
import { useBoardStore } from "@/lib/store/board"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Checkbox } from "./ui/checkbox"
import { confirm } from "@tauri-apps/api/dialog"
import { invoke } from "@tauri-apps/api/tauri"
import { toast } from "sonner"
import { createDirectory } from "@/lib/fs"
import {  TriangleAlertIcon } from "lucide-react"
import { SenseboxConfig } from "@/types"

export default function ConfigForm(
  { setModal }: { setModal: (open: boolean) => void } = { setModal: () => {} }
) {
  const { config, serialPort, setConfig } = useBoardStore()

  const initialSenseboxId = config?.sensebox_id ?? ""
  const initialName = config?.name ?? ""
  const initialTempId = config?.temp_id ?? ""
  const initialHumiId = config?.humi_id ?? ""

  const [confirmed, setConfirmed] = useState(false)
  const [senseboxId, setSenseboxId] = useState(initialSenseboxId)
  const [name, setName] = useState(initialName)
  const [tempId, setTempId] = useState(initialTempId)
  const [humiId, setHumiId] = useState(initialHumiId)
  const [loading, setLoading] = useState(false)
  const handleSubmit = async (e: React.FormEvent) => {
    setLoading(true)
    e.preventDefault()
    const commandString = [
      `NAME=${name}`,
      `DEVICE_ID=${senseboxId}`,
      `TEMPERATUR_SENSORID=${tempId}`,
      `LUFTFEUCHTE_SENSORID=${humiId}`,
      "END",
    ].join("\r\n")

    try {
      await invoke("write_file", {
        port: serialPort?.port,
        command: `<5 ${commandString}>`,
      })
      toast.success("Konfiguration erfolgreich aktualisiert!")

      const boardConfig: SenseboxConfig = await invoke("connect_read_config", {
        port: serialPort?.port,
        command: "<3 config>",
      })
      await createDirectory(`.reedu/data/${boardConfig.sensebox_id}`)
      setConfig(boardConfig)
      setModal(false)
      
    } catch (err: any) {
      toast.error(`Fehler: ${err.message}`)
    }
    setLoading(false)
  }

  const handleCancel = () => {
    setSenseboxId(initialSenseboxId)
    setName(initialName)
    setTempId(initialTempId)
    setHumiId(initialHumiId)
    setModal(false)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto space-y-4 bg-white p-2 rounded-lg "
    >
       {/* Titel & Beschreibung */}
      <div>
        <h1 className="text-2xl font-bold">Konfiguration bearbeiten</h1>
        <p className="mt-1 text-sm text-gray-600">
          Mit diesem Formular kannst du die Konfigurationsdatei auf der senseBox ändern.
        </p>
      </div>
      {/* Warn-Box um die Checkbox */}
      <div className="border-l-4 border-yellow-500 bg-yellow-50 p-2 rounded-md flex space-x-1">
        <TriangleAlertIcon className="h-5 w-5 text-yellow-500 flex-none" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-yellow-700">
            Vorsicht – wichtige Einstellung
          </p>
          <p className="text-sm text-yellow-700">
            Verändere diese Werte nur, wenn du genau weißt, was du tust!
          </p>
          <div className="flex items-center mt-2 space-x-2">
            <Checkbox
              id="confirm"
              checked={confirmed}
              onCheckedChange={(val) => setConfirmed(!!val)}
            />
            <Label htmlFor="confirm" className="cursor-pointer">
              Ich weiß, was ich tue
            </Label>
          </div>
        </div>
      </div>

      {/* Felder */}
      <div className="flex items-center space-x-4">
        <Label htmlFor="config-name" className="w-40">
          Name
        </Label>
        <Input
          id="config-name"
          disabled={!confirmed}
          className="disabled:opacity-50"
          value={name}
          onChange={(e) => setName(e.target.value.replace(/\s+/g, ""))}
        />
      </div>

      <div className="flex items-center space-x-4">
        <Label htmlFor="sensebox-id" className="w-40">
          senseBox ID
        </Label>
        <Input
          id="sensebox-id"
          disabled={!confirmed}
          className="disabled:opacity-50"
          value={senseboxId}
          onChange={(e) => setSenseboxId(e.target.value)}
        />
      </div>

      <div className="flex items-center space-x-4">
        <Label htmlFor="temp-id" className="w-40">
          Temperatur-ID
        </Label>
        <Input
          id="temp-id"
          disabled={!confirmed}
          className="disabled:opacity-50"
          value={tempId}
          onChange={(e) => setTempId(e.target.value)}
        />
      </div>

      <div className="flex items-center space-x-4">
        <Label htmlFor="humi-id" className="w-40">
          Luftfeuchte-ID
        </Label>
        <Input
          id="humi-id"
          disabled={!confirmed}
          className="disabled:opacity-50"
          value={humiId}
          onChange={(e) => setHumiId(e.target.value)}
        />
      </div>

      {/* Buttons unten rechts */}
      <div className="flex justify-end space-x-4 pt-4 border-t">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Abbrechen
        </Button>
        <Button type="submit" disabled={!confirmed || loading}>
        {/* show a small spinner and loading text when loading */}
          {loading ? (
            <div>

  <svg
    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      stroke-width="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    ></path>
  </svg>            
            </div>
          ) : confirmed ? (
            "Speichern"
          ) : (
            "Speichern"
          )}
        </Button>
      </div>
    </form>
  )
}
