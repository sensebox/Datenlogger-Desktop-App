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
#include <SPI.h>
#include <senseBoxIO.h>
#include <MD5.h>

// set up variables using the SD utility library functions:
Sd2Card card;
SdVolume volume;
SdFile root;
SdFile file;

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

    if (!card.init(SPI_HALF_SPEED, chipSelect)) {
      Serial.println("initialization failed. Things to check:");
      Serial.println("* is a card inserted?");
      Serial.println("* is your wiring correct?");
      Serial.println("* did you change the chipSelect pin to match your shield or module?");
      while (1);
    } else {
      Serial.println("Wiring is correct and a card is present.");
    }

    // Now we will try to open the 'volume'/'partition' - it should be FAT16 or FAT32
    if (!volume.init(card)) {
      Serial.println("Could not find FAT16/FAT32 partition.\nMake sure you've formatted the card");
      while (1);
    }

    if (!root.openRoot(volume)) {
      Serial.println("Could not open root of volume");
      while (1);
    }
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
      printRoot();
      break;
    case 2:
      printFileContent(cmdMsg);
      break;
    case 3: {
      String configFilename = findConfigFile();
      printFileContent(configFilename.c_str());
      break;
    }
    case 4:
      deleteFile(cmdMsg);
      break;
    default:
      break;
  }
}

SdFile getParentDir(const char *filepath, int *index) {
    // get parent directory
    SdFile d1;
    SdFile d2;

    d1.openRoot(volume); // start with the mostparent, root!

    // we'll use the pointers to swap between the two objects
    SdFile *parent = &d1;
    SdFile *subdir = &d2;

    const char *origpath = filepath;

    while (strchr(filepath, '/')) {

      // get rid of leading /'s
      if (filepath[0] == '/') {
        filepath++;
        continue;
      }

      if (! strchr(filepath, '/')) {
        // it was in the root directory, so leave now
        break;
      }

      // extract just the name of the next subdirectory
      uint8_t idx = strchr(filepath, '/') - filepath;
      if (idx > 12) {
        idx = 12;  // don't let them specify long names
      }
      char subdirname[13];
      strncpy(subdirname, filepath, idx);
      subdirname[idx] = 0;

      // close the subdir (we reuse them) if open
      subdir->close();
      if (! subdir->open(parent, subdirname, O_READ)) {
        // failed to open one of the subdirectories
        return SdFile();
      }
      // move forward to the next subdirectory
      filepath += idx;

      // we reuse the objects, close it.
      parent->close();

      // swap the pointers
      SdFile *t = parent;
      parent = subdir;
      subdir = t;
    }

    *index = (int)(filepath - origpath);
    // parent is now the parent directory of the file!
    return *parent;
  }

/*
 * CMD API
 */

 void printRoot() {

    int pathidx = 0;

    // do the interactive search
    SdFile parentdir = getParentDir("/", &pathidx);
    parentdir.ls(LS_R);
 }

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

String getFileContent(File file) {
  // Lesen und Ausgeben des Dateiinhalts
  while (file.available()) {
    char data = file.read();
    Serial.write(data);
  }
  Serial.println();
}

 String findConfigFile() {
  String configFilename = "";
  bool configFileFound = false;
  // Öffnen des Root-Verzeichnisses
  File root = SD.open("/");
  if (!root) {
    Serial.println("Fehler beim Öffnen des Root-Verzeichnisses");
    return "Error opening root folder";
  }
  // Durchsuchen aller Dateien und Ordner im Root-Verzeichnis
  while (!configFileFound) {
    File file = root.openNextFile();
    if (!file) {
      // Es wurden alle Dateien und Ordner durchlaufen
      break;
    }

    // Überprüfen, ob es sich um ein Verzeichnis handelt
    if (file.isDirectory()) {
      // Ausgabe des Verzeichnisnamens im seriellen Monitor
      continue;
    }
    else {
      // Ausgabe des Dateinamens im seriellen Monitor
      String fileName = file.name();

      // Skip special MacOS files
      if(fileName.indexOf("~") > 0) {
        continue;
      }

      if (fileName.endsWith(".cfg") || fileName.endsWith(".CFG")) {
        configFilename = fileName;
        break;
      }
    }

    // Schließen der Datei
    file.close();
  }

  // Schließen des Root-Verzeichnisses
  root.close();

  return configFilename;
}