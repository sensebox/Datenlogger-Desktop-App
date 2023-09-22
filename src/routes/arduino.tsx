"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { invoke } from "@tauri-apps/api/tauri";
import { useEffect } from "react";

const schema = z.object({
  SSID: z.string().min(1),
  password: z.string().min(1),
  senseBoxID: z.string().min(1),
  tempID: z.string().min(1),
  humID: z.string().min(1),
  pm1ID: z.string().min(1),
  pm25ID: z.string().min(1),
  pm40ID: z.string().min(1),
  pm10ID: z.string().min(1),
  accXID: z.string().min(1),
  accYID: z.string().min(1),
  accZID: z.string().min(1),
  speedID: z.string().min(1),
});
export default function Arduino() {
  const form = useForm();

  useEffect(() => {
    invoke("list_disks");
  });

  const handleSubmit = async (data: any) => {
    console.log(data);
    await invoke("upload_to_usb", { data });
    await invoke("list_disks");
  };

  return (
    <div className="flex flex-col p-4 gap-2">
      <div>Hier die Config Dateien für die senseBox:bike schreiben! </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-2">
          <FormField
            control={form.control}
            name="SSID"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SSID</FormLabel>
                <FormControl>
                  <Input placeholder="SSID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="Passwort"
            disabled={true}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Passwort</FormLabel>
                <FormControl>
                  <Input disabled={true} placeholder="Passwort" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className="float-right" type="submit">
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
}
