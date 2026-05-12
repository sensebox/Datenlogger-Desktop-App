/*
  senseBox microSD card data logger for temperature & humidity
  Dataformat ready for manual upload to OSeM
  Hardwaresetup:
   senseBox MCU mini + microSD card (CS is D28)
   senseBox Temperature & Humidity Sensor (HDC1080) on I2C
   Beitan GNSS BN220 || BN-880 on UART
   Custom BMS + Samsung ICR18650-26J (26J3) batteries - 2600mAh - 10A
   Sunon MF25100V3-1000U-A99 axial fan for active air flow on hdc1080
  Author: Ericson Thieme-Garmann, Reedu GmbH & Co. KG - Home of senseBox
  Version: last updated 12 May 2026 by Jan Wirwahn
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

// ------------------------------------------------------
// Debug switch
// 1 = Serial debug output enabled
// 0 = Serial debug output disabled for production use
// ------------------------------------------------------
#define DEBUG_SERIAL 0

#if DEBUG_SERIAL
  #define DBG_BEGIN(baud) Serial.begin(baud)
  #define DBG_PRINT(x) Serial.print(x)
  #define DBG_PRINTLN(x) Serial.println(x)
#else
  #define DBG_BEGIN(baud)
  #define DBG_PRINT(x)
  #define DBG_PRINTLN(x)
#endif

// Instantiate SerialSDManager
SerialSDManager sdManager(28); // Pass the chip select pin, 28 for senseBox

File myFile;
String fileName = "00000001.csv";
SDConfig cfg;
unsigned int fileCount = 0;
unsigned short lineCount = 0;
const int maxLineLength = 45;

static NMEAGPS gps;
static gps_fix fix;

float lat = 0.0;
float lon = 0.0;
float alt = 0.0;
float lat_old = 0.0;
float lon_old = 0.0;

unsigned int day = 0;
unsigned int month = 0;
unsigned int year = 0;
unsigned int hour = 0;
unsigned int minute = 0;
unsigned int second = 0;

Adafruit_HDC1000 hdc = Adafruit_HDC1000();
float temp = 0.0;
float humi = 0.0;

// RGB LED
Adafruit_NeoPixel rgb(1, 6);

uint32_t red;
uint32_t yellow;
uint32_t green;
uint32_t blue;
uint32_t magenta;
uint32_t cyan;
uint32_t black;
uint32_t white;

// Settings from config
char *SENSEBOX_ID;
char *TEMP_ID;
char *HUMI_ID;

unsigned long uploadInterval = 1000;
unsigned long lastUpload = 0;
unsigned long currentTime = 0;

void setup()
{
    DBG_BEGIN(115200);

#if DEBUG_SERIAL
    delay(1000);
#endif

    // Enable I2C
    pinMode(14, OUTPUT);
    digitalWrite(14, HIGH);
    delay(20);

    // WS2812 RGB LED
    rgb.begin();
    rgb.setBrightness(60);

    red = rgb.Color(255, 0, 0);
    yellow = rgb.Color(255, 200, 0);
    green = rgb.Color(0, 255, 0);
    blue = rgb.Color(0, 0, 255);
    magenta = rgb.Color(255, 0, 255);
    cyan = rgb.Color(0, 128, 255);
    black = rgb.Color(0, 0, 0);
    white = rgb.Color(255, 255, 255);

    rgb.clear();
    rgb.setPixelColor(0, yellow);
    rgb.show();

    // Enable UART
    pinMode(9, OUTPUT);
    digitalWrite(9, HIGH);
    delay(20);

    sdManager.begin();

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

    gpsPort.begin(9600);

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
    rgb.show();

    DBG_PRINTLN("Setup done. Waiting for valid GPS fix with date and time...");
}

void loop()
{
    sdManager.checkForSerialInput();
    GPSloop();
}

static void GPSloop()
{
    while (gps.available(gpsPort))
    {
        fix = gps.read();
        doSomeWork();
    }
}

static void doSomeWork()
{
    currentTime = millis();

    if (currentTime >= lastUpload + uploadInterval)
    {
        lastUpload = currentTime;
        obtain_data();
    }
}

// Callback for SD file timestamps
void dateTimeFun(uint16_t *date, uint16_t *time)
{
    if (fix.valid.date)
    {
        *date = FAT_DATE(2000 + fix.dateTime.year,
                         fix.dateTime.month,
                         fix.dateTime.date);
    }

    if (fix.valid.time)
    {
        *time = FAT_TIME(fix.dateTime.hours,
                         fix.dateTime.minutes,
                         fix.dateTime.seconds);
    }
}

void obtain_data()
{
    // Check GPS location and altitude
    if (fix.valid.location && fix.valid.altitude)
    {
        lat = fix.latitude();
        lon = fix.longitude();
        alt = fix.altitude();

        rgb.setPixelColor(0, green);
        rgb.show();

        // Skip if position has not changed
        if (lat == lat_old && lon == lon_old)
        {
            DBG_PRINTLN("Location not updated. Skipping log entry.");

            rgb.setPixelColor(0, blue);
            rgb.show();

            return;
        }
    }
    else
    {
        DBG_PRINT("GPS location/altitude invalid. location=");
        DBG_PRINT(fix.valid.location);
        DBG_PRINT(" altitude=");
        DBG_PRINTLN(fix.valid.altitude);

        rgb.setPixelColor(0, blue);
        rgb.show();

        return;
    }

    // Do not log without valid GPS date and time
    if (!fix.valid.date || !fix.valid.time)
    {
        DBG_PRINT("GPS date/time invalid. date=");
        DBG_PRINT(fix.valid.date);
        DBG_PRINT(" time=");
        DBG_PRINTLN(fix.valid.time);

        DBG_PRINT("Raw GPS date/time: ");
        DBG_PRINT(fix.dateTime.year);
        DBG_PRINT("-");
        DBG_PRINT(fix.dateTime.month);
        DBG_PRINT("-");
        DBG_PRINT(fix.dateTime.date);
        DBG_PRINT(" ");
        DBG_PRINT(fix.dateTime.hours);
        DBG_PRINT(":");
        DBG_PRINT(fix.dateTime.minutes);
        DBG_PRINT(":");
        DBG_PRINTLN(fix.dateTime.seconds);

        rgb.setPixelColor(0, red);
        rgb.show();

        return;
    }

    month = fix.dateTime.month;
    day = fix.dateTime.date;
    year = fix.dateTime.year;
    hour = fix.dateTime.hours;
    minute = fix.dateTime.minutes;
    second = fix.dateTime.seconds;

    char timestamp[32];

    snprintf(timestamp, sizeof(timestamp),
             "20%02u-%02u-%02uT%02u:%02u:%02uZ",
             year, month, day, hour, minute, second);

    DBG_PRINT("Timestamp: ");
    DBG_PRINTLN(timestamp);

    // Read sensor values
    temp = hdc.readTemperature();
    humi = hdc.readHumidity();

    String dataString = "";

    dataString = TEMP_ID;
    dataString += ",";
    dataString += String(temp, 1);
    dataString += ",";
    dataString += String(timestamp);
    dataString += ",";
    dataString += String(lon, 8);
    dataString += ",";
    dataString += String(lat, 8);
    dataString += ",";
    dataString += String(alt, 1);
    dataString += "\n";

    dataString += HUMI_ID;
    dataString += ",";
    dataString += String(humi, 1);
    dataString += ",";
    dataString += String(timestamp);
    dataString += ",";
    dataString += String(lon, 8);
    dataString += ",";
    dataString += String(lat, 8);
    dataString += ",";
    dataString += String(alt, 1);

    DBG_PRINTLN(dataString);

    if (lineCount >= 2490)
    {
        getNewFileName();
        lineCount = 0;
    }

    SdFile::dateTimeCallback(dateTimeFun);
    myFile = SD.open(fileName, FILE_WRITE);

    if (myFile)
    {
        myFile.println(dataString);
        myFile.close();

        lineCount += 2;
        lat_old = lat;
        lon_old = lon;

        rgb.setPixelColor(0, green);
        rgb.show();
    }
    else
    {
        DBG_PRINT("Error opening ");
        DBG_PRINTLN(fileName);

        rgb.setPixelColor(0, magenta);
        rgb.show();

        delay(10000);
    }

    DBG_PRINTLN();
}

void getNewFileName()
{
    fileCount++;

    char newFileName[13];
    snprintf(newFileName, sizeof(newFileName), "%08u.csv", fileCount);

    fileName = String(newFileName);

    DBG_PRINT("New filename: ");
    DBG_PRINTLN(fileName);
}

void readSDConfig()
{
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
                name.toCharArray(cname, 50);
                confFileName = cname;
                break;
            }
        }

        cfgfile.close();
    }

    root.close();

    if (cfg.begin(confFileName, maxLineLength))
    {
        DBG_PRINT("Reading config file: ");
        DBG_PRINTLN(confFileName);

        while (cfg.readNextSetting())
        {
            if (cfg.nameIs("NAME"))
            {
                DBG_PRINT("NAME: ");
                DBG_PRINTLN(cfg.copyValue());
            }
            else if (cfg.nameIs("DEVICE_ID"))
            {
                SENSEBOX_ID = cfg.copyValue();

                DBG_PRINT("DEVICE_ID: ");
                DBG_PRINTLN(SENSEBOX_ID);
            }
            else if (cfg.nameIs("TEMPERATUR_SENSORID"))
            {
                TEMP_ID = cfg.copyValue();

                DBG_PRINT("TEMP_ID: ");
                DBG_PRINTLN(TEMP_ID);
            }
            else if (cfg.nameIs("LUFTFEUCHTE_SENSORID"))
            {
                HUMI_ID = cfg.copyValue();

                DBG_PRINT("HUMI_ID: ");
                DBG_PRINTLN(HUMI_ID);
            }
            else
            {
                DBG_PRINT("SETTING UNKNOWN: ");
                DBG_PRINTLN(cfg.getName());
            }
        }

        cfg.end();
    }
    else
    {
        rgb.setPixelColor(0, cyan);
        rgb.setBrightness(128);
        rgb.show();

        while (true)
            ;
    }
}
