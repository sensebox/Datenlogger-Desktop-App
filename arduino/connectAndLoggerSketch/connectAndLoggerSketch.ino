/*
  senseBox microSD card data logger for temperautre & humidity
  Dataformat ready for manual upload to OSeM
  Hardwaresetup:
   senseBox MCU mini + microSD card (CS is D28)
   senseBox Temperature & Humidity Sensor (HDC1080) on I2C
   Beitan GNSS BN-880 on UART
   Custom BMS + Samsung ICR18650-26J (26J3) batteries - 2600mAh - 10A
   Sunon MF25100V3-1000U-A99 axial fan for active air flow on hdc1080
  Author: Ericson Thieme-Garmann, Reedu GmbH & Co. KG - Home of senseBox
  Version: last updated 12 Dec. 2024 by Jan Wirwahn
  This code is in the public domain.
*/

#include <SerialSDManager.h>
#include <Wire.h>
#include <Adafruit_HDC1000.h>
#include <Adafruit_NeoPixel.h>
#include <NMEAGPS.h>
#include <GPSport.h>
#include <Streamers.h>
#include <SDConfig.h>

// Instantiate SerialSDManager
SerialSDManager sdManager(28); // Pass the chip select pin (28 for senseBox)

File myFile;
String fileName = "00000001.csv";
SDConfig cfg;
unsigned int fileCount = 0;
unsigned short lineCount = 0;
const int maxLineLength = 45; // max cfg line length

static NMEAGPS  gps;
static gps_fix  fix;
float lat, lon, alt;
float lat_old, lon_old = 0.0;
unsigned int day, month, year, hour, minute, second;

Adafruit_HDC1000 hdc = Adafruit_HDC1000();
float temp, humi;

// color codes
Adafruit_NeoPixel rgb(1, 6);              // LED strip count, digital pin
uint32_t red = rgb.Color(255, 0, 0);      // status GPS
uint32_t yellow = rgb.Color(255, 200, 0); // status setup() mode
uint32_t green = rgb.Color(0, 255, 0);    // status loop() mode
uint32_t blue = rgb.Color(0, 0, 255);
uint32_t magenta = rgb.Color(255, 0, 255); // status code SD write error
uint32_t cyan = rgb.Color(0, 128, 255);    // status config error
uint32_t black = rgb.Color(0, 0, 0);
uint32_t white = rgb.Color(255, 255, 255);

// Settings from config
char *SENSEBOX_ID;
char *TEMP_ID;
char *HUMI_ID;

unsigned long uploadInterval = 1000; // in milliseconds
unsigned long lastUpload = 0;
unsigned long currentTime = 0;

void setup() {
    Serial.begin(9600);
    delay(1000);
    // enable I2C
    pinMode(14, OUTPUT);
    digitalWrite(14, HIGH);
    delay(20);


    // WS2812 RGB LED
    rgb.begin();
    rgb.setBrightness(60);
    rgb.clear();
    rgb.setPixelColor(0, yellow);
    rgb.show();

      // enable UART
    pinMode(9, OUTPUT);
    digitalWrite(9, HIGH);
    delay(20);

    sdManager.begin(); // Initialize SD Manager
    do
    {
        getNewFileName();
    } while (SD.exists(fileName));
    myFile = SD.open(fileName, FILE_WRITE);    
    if (myFile)
    {
        myFile.close();
        delay(1000);
        SD.remove(fileName);
    }
    else
    {
        rgb.setPixelColor(0, magenta);
        rgb.show();
        while (true)
            ;
    }
    readSDConfig();
    gpsPort.begin( 9600 );
    if (!hdc.begin(0x40))
    {
        while (true)
        {
            rgb.setPixelColor(0, yellow);
            rgb.show();
            delay(1000);
            rgb.setPixelColor(0, white);
            rgb.show();
            delay(1000);
        }
    }
    rgb.clear();


    }
void loop() {
    sdManager.checkForSerialInput(); // Handle serial input through SD Manager
    GPSloop(); // Continue your existing loop logic
}



// helper functions 

static void GPSloop()
{
  while (gps.available( gpsPort )) {
    fix = gps.read();
    doSomeWork();
  }

}

static void doSomeWork()
{
  currentTime = millis();
            if (currentTime >= (lastUpload + uploadInterval))
            {
                lastUpload = currentTime;
                obtain_data();
            }
}

// call back for file timestamps
void dateTimeFun(uint16_t *date, uint16_t *time)
{
    uint8_t y = 2000 + fix.dateTime.year;
    // return date using FAT_DATE macro to format fields
    *date = FAT_DATE(fix.dateTime.year, fix.dateTime.month, fix.dateTime.date);

    // return time using FAT_TIME macro to format fields
    *time = FAT_TIME(fix.dateTime.hours, fix.dateTime.minutes, fix.dateTime.seconds);
}

void obtain_data()
{
    // check for GPS connection
    if (fix.valid.location && fix.valid.altitude)
    {
        lat = fix.latitude();
        lon = fix.longitude();
        alt = fix.altitude();
        rgb.setPixelColor(0, green);
        rgb.show();
        // check if position fix can be renewed. If not, skip function
        if (lat == lat_old && lon == lon_old)
        {
            // Serial.println("Location not updated: \nOld: " + String(lat_old, 8) + "," + String(lon_old, 8) + "\nNew: " + String(lat, 8) + "," + String(lon, 8));
            rgb.setPixelColor(0, blue);
            rgb.show();
            delay(1000);
            rgb.setPixelColor(0, green);
            rgb.show();
            delay(1000);
            rgb.setPixelColor(0, blue);
            rgb.show();
            delay(1000);
            rgb.setPixelColor(0, green);
            rgb.show();
            delay(1000);
            return;
        }
        else
        {
            // Serial.println("Location is valid.");
        }
    }
    else
    {
        // Serial.println("Location is not available.");
        rgb.setPixelColor(0, blue);
        rgb.show();
        return;
    }

    if (fix.valid.date)
    {
        // Serial.println("Date is valid.");
        month = fix.dateTime.month;
        day = fix.dateTime.date;
        year = fix.dateTime.year;
    }
    else
        // Serial.println("Date is not available.");

    if (fix.valid.time)
    {
        // Serial.println("Time is valid.");
        if (fix.dateTime.hours < 10)
            ;
        hour = fix.dateTime.hours;
        if (fix.dateTime.minutes < 10)
            ;
        minute = fix.dateTime.minutes;
        if (fix.dateTime.seconds < 10)
            ;
        second = fix.dateTime.seconds;
    }
    else {}
        // Serial.println("Time is not available.");

    // create timestamp
    char timestamp[64];
    sprintf(timestamp, "20%02d-%02d-%02dT%02d:%02d:%02dZ", year, month, day, hour, minute, second);

    // read sensor values
    temp = hdc.readTemperature();
    humi = hdc.readHumidity();

    // prepare data for writing to SD card
    String dataString = "";

    dataString = TEMP_ID;
    dataString += String(",");
    dataString += String(temp, 1);
    dataString += String(",");
    dataString += String(timestamp);
    dataString += String(",");
    dataString += String(lon, 8);
    dataString += String(",");
    dataString += String(lat, 8);
    dataString += String(",");
    dataString += String(alt, 1);
    dataString += String("\n");
    dataString += HUMI_ID;
    dataString += String(",");
    dataString += String(humi, 1);
    dataString += String(",");
    dataString += String(timestamp);
    dataString += String(",");
    dataString += String(lon, 8);
    dataString += String(",");
    dataString += String(lat, 8);
    dataString += String(",");
    dataString += String(alt, 1);
    // Serial.println(dataString);

    if (lineCount >= 2490)
    {
        // Serial.println("End of file length.");
        getNewFileName();
        lineCount = 0;
    }

    SdFile::dateTimeCallback(dateTimeFun);
    myFile = SD.open(fileName, FILE_WRITE);

    if (myFile)
    {
        // Serial.print("Logging data to " + fileName);
        myFile.println(dataString);
        myFile.close();
        lineCount += 2;
        lat_old = lat;
        lon_old = lon;
        // Serial.println(" done.");
    }
    else
    {
        // Serial.println("error opening " + fileName);
        rgb.setPixelColor(0, magenta);
        rgb.show();
        delay(10000);
    }
    Serial.println();
}

void getNewFileName()
{
    fileCount++;
    char newFileName[12];
    sprintf(newFileName, "%08d.csv", fileCount);
    fileName = String(newFileName);
    // Serial.println("Updating filename to " + String(newFileName));
    //catch "too much files"
}

void readSDConfig()
{
    // Serial.print("Searching for config file...");
    const char *confFileName;
    File root = SD.open("/");
    while (true)
    {
        File cfgfile = root.openNextFile();
        if (!cfgfile)
        {
            confFileName = "None";
            break;
        }
        else
        {
            String name = cfgfile.name();
            char cname[50];
            name.toLowerCase();
            if (name.indexOf(".cfg") != -1)
            {
                name.toCharArray(cname,50);
                confFileName = cname;
                // Serial.print("found ");
                // Serial.print(confFileName);
                break;
            }
        }
        cfgfile.close();
    }
    root.close();

    if (cfg.begin(confFileName, maxLineLength))
    {
        // Serial.println(" reading config:");
        while (cfg.readNextSetting())
        {
            if (cfg.nameIs("NAME"))
            {
                // Serial.println("    NAME: " + String(cfg.copyValue()));
            }
            else if (cfg.nameIs("DEVICE_ID"))
            {
                SENSEBOX_ID = cfg.copyValue();
                // Serial.println("    DEVICE_ID: " + String(cfg.copyValue()));
            }
            else if (cfg.nameIs("TEMPERATUR_SENSORID"))
            {
                TEMP_ID = cfg.copyValue();
                // Serial.println("    TEMP_ID: " + String(cfg.copyValue()));
            }
            else if (cfg.nameIs("LUFTFEUCHTE_SENSORID"))
            {
                HUMI_ID = cfg.copyValue();
                // Serial.println("    HUMI_ID: " + String(cfg.copyValue()));
            }
            else{
                // Serial.println("SETTING UNKNOWN: " + String(cfg.getName()));
            }
        }
        cfg.end();
        // Serial.println("done.");
    }
    else
    {
        // Serial.println("not found! Halting program.");
        rgb.setPixelColor(0, cyan);
        rgb.setBrightness(128);
        rgb.show();
        while (true)
            ;
    }
}




