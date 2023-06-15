/*
 * log files should be in \logs directory on SD card
 * each input command ends with <END>
 * commands:
 * 1 root <END> : Writes files and directories to the serial console
 * 2 /logs/test.txt <END> : Writes file content to the serial console
 * 3 config <END> : Writes config file to the serial console
 * 4 /logs/test.txt <END> - delete file with given name
 */

#include <SD.h>
#include <senseBoxIO.h>
#include <MD5.h>
/*
 * senseBox MCU Pins
 */
const int chipSelect = 28;

/*
 * senseBox MCU serial command communication protocol
 */
const byte numChars = 50;
char receivedChars[numChars];
char tempChars[numChars];        // temporary array for use when parsing

// variables to hold the parsed data
char cmdMsg[numChars] = {0};
int cmdId = 0;

boolean newData = false;

//============

void setup() {
    Serial.begin(115200);

    // wait for Serial Monitor to connect. Needed for native USB port boards only:
    while (!Serial);
    Serial.print("Initializing SD card...");

    if (!SD.begin(chipSelect))
    {
      Serial.println("initialization failed. Card inserted?");
      return;
    }
    Serial.println("SD ok");
}

//============

void loop() {
    recvWithStartEndMarkers();
    if (newData == true) {
        strcpy(tempChars, receivedChars);
            // this temporary copy is necessary to protect the original data
            // because strtok() used in parseData() replaces the commas with \0
        parseData();
        executeCommand();
        newData = false;
    }
}

//============

void recvWithStartEndMarkers() {
    static boolean recvInProgress = false;
    static byte ndx = 0;
    char startMarker = '<';
    char endMarker = '>';
    char rc;

    while (Serial.available() > 0 && newData == false) {
        rc = Serial.read();

        if (recvInProgress == true) {
            if (rc != endMarker) {
                receivedChars[ndx] = rc;
                ndx++;
                if (ndx >= numChars) {
                    ndx = numChars - 1;
                }
            }
            else {
                receivedChars[ndx] = '\0'; // terminate the string
                recvInProgress = false;
                ndx = 0;
                newData = true;
            }
        }

        else if (rc == startMarker) {
            recvInProgress = true;
        }
    }
}

//============

void parseData() {      // split the data into its parts

    char * strtokIndx; // this is used by strtok() as an index

    strtokIndx = strtok(tempChars, " ");
    cmdId = atoi(strtokIndx);

    strtokIndx = strtok(NULL," ");      // get the first part - the string
    strcpy(cmdMsg, strtokIndx); // copy it to messageFromPC
}

void executeCommand() {
  switch(cmdId) {
    case 1:
      printAllFiles();
      break;
    case 2:
      printFileContent(cmdMsg);
      break;
    case 3:
      printFileContent("/config/CONFIG.CFG");
      break;
    case 4:
      deleteFile(cmdMsg);
      break;
    default:
      break;
  }
}

/*
 * CMD API
 */

 void printAllFiles() {
  // Öffnen des Root-Verzeichnisses
  File root = SD.open("/logs/");
  if (!root) {
    Serial.println("Fehler beim Öffnen des Root-Verzeichnisses");
    return;
  }
  // Durchsuchen aller Dateien und Ordner im Root-Verzeichnis
  while (true) {
    File file = root.openNextFile();
    if (!file) {
      // Es wurden alle Dateien und Ordner durchlaufen
      break;
    }

    // Überprüfen, ob es sich um ein Verzeichnis handelt
    if (file.isDirectory()) {
      // Ausgabe des Verzeichnisnamens im seriellen Monitor
      Serial.println("Verzeichnis: " + String(file.name()));

      // Öffnen des Verzeichnisses
      File subdir = SD.open(file.name());

      // Durchsuchen aller Dateien im Verzeichnis
      while (true) {
        File subfile = subdir.openNextFile();
        if (!subfile) {
          // Es wurden alle Dateien im Verzeichnis durchlaufen
          break;
        }

        // Ausgabe des Dateinamens im seriellen Monitor
        Serial.println("  Datei: " + String(subfile.name()));

        // Schließen der Datei
        subfile.close();
      }

      // Schließen des Verzeichnisses
      subdir.close();
    }
    else {
      // Ausgabe des Dateinamens im seriellen Monitor
      Serial.print(String(file.name()));
      Serial.print(",");
      Serial.println(String(file.size()));
      //getFileContent(file);
    }

    // Schließen der Datei
    file.close();
  }

  // Schließen des Root-Verzeichnisses
  root.close();
}


void printFileContent(const char* filename) {
  File file = SD.open(filename);
  Serial.write(filename);
  Serial.write("|");
  //size_t bufferSize = file.size();
  //int counter = 0;
  //char buf[bufferSize + 1]; // +1 für das Nullzeichen am Ende
  if (file) {
    //while (file.available()) {
    //  char c = file.read();
    //  if (c == ',') {
    //    counter++;
    //  }
    //  Serial.write(c);
      //buf[counter] = c;
      //counter++;
    //}
    while (file.available()) {
      Serial.write(file.read());
    }
    //buf[counter] = '\0';
    file.close();
    //Serial.write(buffer);
    Serial.write("|");
    Serial.write("end");
    //printMd5Hash(buf, bufferSize);
  } else {
    Serial.println("Fehler beim Öffnen der Datei.");
  }
}

void printMd5Hash (char* fileContent, size_t bufferSize ){
    unsigned char* hash = MD5::make_hash(fileContent);
    char *md5str = MD5::make_digest(hash,16);

    Serial.write(md5str);
    free(md5str);
    free(hash);
}

void deleteFile(const char* fileName) {
  if (SD.exists(fileName)) {
    if (SD.remove(fileName)) {
      Serial.println("Datei erfolgreich gelöscht.");
    } else {
      Serial.println("Fehler beim Löschen der Datei.");
    }
  } else {
    Serial.println("Die Datei existiert nicht.");
  }
}

void getFileContent(File file) {
  // Lesen und Ausgeben des Dateiinhalts
  while (file.available()) {
    char data = file.read();
    Serial.write(data);
  }
  Serial.println();
}