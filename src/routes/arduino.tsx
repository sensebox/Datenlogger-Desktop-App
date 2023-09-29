"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { invoke } from "@tauri-apps/api/tauri";
import { useEffect, useState } from "react";
import useOpenSenseMapLogin from "@/lib/useOpenSenseMapLogin";
import {
  SelectContent,
  SelectTrigger,
  Select,
  SelectValue,
  SelectItem,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/ui/select";
import MapWithBoundingBox from "@/components/MapWithBoundingBox";
import { Badge } from "@/components/ui/ui/badge";
import { useBoardStore } from "@/lib/store/board";
import { toast } from "@/components/ui/use-toast";
import LoadingOverlay from "@/components/ui/LoadingOverlay";

const schema = z.object({
  ssid: z.string().min(1),
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
  distanceID: z.string().min(1),
  homeMinLon: z.number().min(-180).max(180),
  homeMaxLon: z.number().min(-180).max(180),
  homeMinLat: z.number().min(-90).max(90),
  homeMaxLat: z.number().min(-90).max(90),
  homeDefLon: z.number().min(-180).max(180),
  homeDefLat: z.number().min(-90).max(90),
});
export default function Arduino() {
  const [userBoxes, setUserBoxes] = useState<any[]>([]);
  const [selectedBox, setSelectedBox] = useState<any>();
  const { getAllUserBoxes } = useOpenSenseMapLogin();
  const [center, setCenter] = useState<any[]>([50.960714, 10.193841]);
  const { serialPort } = useBoardStore();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchAllUserBoxes = async () => {
      const boxes = await getAllUserBoxes();
      setUserBoxes(boxes);
    };
    fetchAllUserBoxes();
  }, []);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      ssid: "",
      password: "",
      senseBoxID: "",
      tempID: "",
      humID: "",
      pm1ID: "",
      pm25ID: "",
      pm40ID: "",
      pm10ID: "",
      accXID: "",
      accYID: "",
      accZID: "",
      speedID: "",
      distanceID: "",
      homeMinLon: 0,
      homeMaxLon: 0,
      homeMinLat: 0,
      homeMaxLat: 0,
      homeDefLon: 0,
      homeDefLat: 0,
    },
  });

  useEffect(() => {
    // sets values based on selected box
  }, [selectedBox]);
  const handleSubmit = async (data: any) => {
    const dataToString = buildString(data);
    if (!serialPort) {
      toast({
        variant: "destructive",
        title: "No board connected",
        description: "Please connect a board first",
        duration: 5000,
      });
    } else {
      try {
        setLoading(true);
        // only wait for 10 seconds for the board to respond
        const boardResponse: string = await invoke("write_to_cfg", {
          port: serialPort.port,
          data: dataToString,
        });
        // if the last 4 characters are |end then the board has received the data
        if (boardResponse.slice(-4) !== "|end") {
          throw new Error(
            "The file could not be uploaded please try again! (Not ending with |end)"
          );
        }
        toast({
          title: "Successfully uploaded data",
          description: "Your data has been uploaded to the board",
          duration: 5000,
        });
        setLoading(false);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error uploading data",
          description: error,
          duration: 5000,
        });
      }
    }
  };

  // function that takes an object and return a string with all the values seperated by a new line dont append a comma if its the last value
  const buildString = (data: any) => {
    let string = "<5 ";
    for (const [key, value] of Object.entries(data)) {
      string += key + "=" + value + ",";
    }
    string = string.slice(0, -1);
    string = string.toLowerCase();
    string += " END>";

    return string;
  };

  const setBoundingBox = (boundingBox: any) => {
    form.setValue("homeMinLon", boundingBox[0]);
    form.setValue("homeMaxLon", boundingBox[1]);
    form.setValue("homeMinLat", boundingBox[2]);
    form.setValue("homeMaxLat", boundingBox[3]);
  };

  const setFakeHome = (fakeHome: any) => {
    form.setValue("homeDefLon", fakeHome[0]);
    form.setValue("homeDefLat", fakeHome[1]);
  };

  const handleSelectChange = (e: any) => {
    setSelectedBox(e);
    console.log(form);
    setCenter([
      e.currentLocation.coordinates[1],
      e.currentLocation.coordinates[0],
    ]);
    form.setValue("senseBoxID", e._id);
    form.setValue("tempID", e.sensors[0]._id);
    form.setValue("humID", e.sensors[1]._id);
    form.setValue("pm1ID", e.sensors[2]._id);
    form.setValue("pm25ID", e.sensors[3]._id);
    form.setValue("pm40ID", e.sensors[4]._id);
    form.setValue("pm10ID", e.sensors[5]._id);
    form.setValue("accXID", e.sensors[6]._id);
    form.setValue("accYID", e.sensors[7]._id);
    form.setValue("accZID", e.sensors[8]._id);
    form.setValue("speedID", e.sensors[9]._id);
    form.setValue("distanceID", e.sensors[10]._id);
  };

  return (
    <div className="flex flex-col p-4 gap-2">
      {loading && <LoadingOverlay />}
      {userBoxes && userBoxes.length > 0 && (
        <Select onValueChange={(e) => handleSelectChange(e)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a box" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>senseBox auswählen</SelectLabel>
              {userBoxes.map((box) => (
                <SelectItem key={box._id} value={box}>
                  <Badge>Mobile</Badge> {box.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-2">
          <div>
            <FormField
              control={form.control}
              name="ssid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SSID</FormLabel>
                  <FormControl>
                    <Input placeholder="SSID" {...field} />
                  </FormControl>
                  <FormDescription>
                    Gebe hier den Netzwerknamen an, von welchem aus die
                    Messwerte hochgeladen werden sollen!{" "}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Passwort</FormLabel>
                  <FormControl>
                    <Input disabled={true} placeholder="Passwort" {...field} />
                  </FormControl>
                  <FormDescription>
                    Gebe hier das Passwort ein, welches für das Netzwerk gilt.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-row  gap-2">
            <div className="flex flex-col grow gap-2">
              {/* add formfields with inputs with all the variables in the schema */}
              <FormField
                control={form.control}
                name="senseBoxID"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Box ID</FormLabel>
                    <FormControl>
                      <Input disabled={true} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tempID"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temp ID</FormLabel>
                    <FormControl>
                      <Input disabled={true} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="humID"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hum ID</FormLabel>
                    <FormControl>
                      <Input disabled={true} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pm1ID"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PM1 ID</FormLabel>
                    <FormControl>
                      <Input disabled={true} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pm25ID"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PM25 ID</FormLabel>
                    <FormControl>
                      <Input disabled={true} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pm40ID"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PM40 ID</FormLabel>
                    <FormControl>
                      <Input disabled={true} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col grow gap-2">
              <FormField
                control={form.control}
                name="pm10ID"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PM10 ID</FormLabel>
                    <FormControl>
                      <Input disabled={true} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accXID"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>accX ID</FormLabel>
                    <FormControl>
                      <Input disabled={true} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accYID"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>accY ID</FormLabel>
                    <FormControl>
                      <Input disabled={true} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="accZID"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>accZ ID</FormLabel>
                    <FormControl>
                      <Input disabled={true} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="speedID"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>speedID</FormLabel>
                    <FormControl>
                      <Input disabled={true} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="distanceID"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>distanceID</FormLabel>
                    <FormControl>
                      <Input disabled={true} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="flex flex-row gap-2">
            <MapWithBoundingBox
              setBoundingBox={setBoundingBox}
              setFakeHome={setFakeHome}
              center={center}
            />
            <div className="flex flex-col">
              <div>
                Gebe hier die Area ein die nicht hochgeladen werden soll
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="homeMinLon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>homeMinLon</FormLabel>
                      <FormControl>
                        <Input disabled={true} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="homeMaxLon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>homeMaxLon</FormLabel>
                      <FormControl>
                        <Input disabled={true} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="homeMinLat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>homeMinLat</FormLabel>
                      <FormControl>
                        <Input disabled={true} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="homeMaxLat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>homeMaxLat</FormLabel>
                      <FormControl>
                        <Input disabled={true} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div>
              <FormField
                control={form.control}
                name="homeDefLon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>homeDefLon</FormLabel>
                    <FormControl>
                      <Input disabled={true} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>{" "}
            <FormField
              control={form.control}
              name="homeDefLat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>homeDefLat</FormLabel>
                  <FormControl>
                    <Input disabled={true} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button className="float-right" type="submit">
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
}
