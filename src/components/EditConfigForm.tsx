import React, { useState } from "react"
import { useBoardStore } from "@/lib/store/board"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Checkbox } from "./ui/checkbox"
import { set } from "date-fns"
import { invoke } from "@tauri-apps/api/tauri"
import { toast } from "sonner"

export default function ConfigForm(
  { setModal }: { setModal: (open: boolean) => void } = { setModal: () => {} }
) {
  const { config, serialPort } = useBoardStore()

  // Initialwerte aus dem Store
  const initialSenseboxId = config?.sensebox_id ?? ""
  const initialName = config?.name ?? ""
  const initialTempId = config?.temp_id ?? ""
  const initialHumiId = config?.humi_id ?? ""

  const [confirmed, setConfirmed] = useState(false)
  const [senseboxId, setSenseboxId] = useState(initialSenseboxId)
  const [name, setName] = useState(initialName)
  const [tempId, setTempId] = useState(initialTempId)
  const [humiId, setHumiId] = useState(initialHumiId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Nutze den Tauri-Confirm-Dialog
    const confirmed = await confirm(
      "Bist du sicher? Dies ändert die Konfigurationsdatei auf der senseBox.",
    )

    if (!confirmed) {
      // Abgebrochen
      return
    }

    let commandString = `NAME=${name.replace(/\s+/g, "")}\r\nDEVICE_ID=${senseboxId}\r\nTEMPERATUR_SENSORID=${tempId}\r\nLUFTFEUCHTE_SENSORID=${humiId}`
    // remove all spaces

    console.log("Sending command:", commandString)

    const updatedConfig = await invoke("write_file", {
      port: serialPort?.port,
      command: `<5 ${commandString} END>`,
    }
    
  ) 
    console.log("Updated config:", updatedConfig)   
    toast.success("Konfiguration erfolgreich aktualisiert!")
    setModal(false)
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
      className="max-w-lg mx-auto space-y-6 bg-white p-6 rounded-lg shadow"
    >
      {/* Titel & Beschreibung */}
      <div>
        <h1 className="text-2xl font-bold">Konfiguration bearbeiten</h1>
        <p className="mt-1 text-sm text-gray-600">
          Mit diesem Formular kannst du die Konfigurationsdatei auf der senseBox ändern.
        </p>
      </div>
            {/* Sicherheits-Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="confirm"
          checked={confirmed}
          onCheckedChange={(val) => setConfirmed(!!val)}
        />
        <Label htmlFor="confirm">Ich weiß was ich tue</Label>
      </div>
      {/* Name */}
      <div className="flex items-center space-x-4">
        <Label htmlFor="config-name" className="w-40">
          Name (keine Leerzeichen)
        </Label>
        <Input
          id="config-name"
          disabled={!confirmed}
          className="disabled:opacity-50"
          value={name}
          onChange={(e) => {
        // Remove all spaces as user types
        setName(e.target.value.replace(/\s+/g, ""))
          }}
          placeholder="z. B. MeinStandort"
        />
      </div>
      {/* senseBox ID */}
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
          placeholder="z. B. 6478a51ce8df1c00083bffac"
        />
      </div>

      {/* Temperatursensor-ID */}
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
          placeholder="z. B. temp_1234"
        />
      </div>

      {/* Luftfeuchte-Sensor-ID */}
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
          placeholder="z. B. humi_5678"
        />
      </div>

      {/* Buttons unten rechts */}
      <div className="flex justify-end space-x-4 pt-4 border-t">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Abbrechen
        </Button>
        <Button             className="bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow-md transition-colors"
 type="submit">Speichern</Button>
      </div>
    </form>
  )
}
