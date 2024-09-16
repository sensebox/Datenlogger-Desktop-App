# Connect App Desktop

Mit der Connect app kann eine senseBox mit dem PC verbunden werden. Über das Tool können Daten verwaltet und hochgeladen werden!
![alt text](image.png)

## Pre-requisite

- Node installiert
- Rust installiert `curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh`
- Possible dev dependencies can be looked up [here](https://tauri.app/v1/guides/getting-started/prerequisites)

## Starting the app in development

1. `npm install # yarn add`
2. `npm run tauri dev # yarn tauri dev`

## Running the App

Installer Dateien werden in [Releases](https://github.com/sensebox/connect-app-desktop/releases) bereitgestellt

Alternativ kann der Build Prozess mit `yarn tauri build` ausgeführt werden.

## Arduino

Lade den Arduino Sketch in `arduino-connect/connect` auf eine senseBox. Danach:

- Wähle Board im Dropdown aus (alle Seriellen Monitoren von Arduion o.ä. vorher schließen)
- Drücke 'Get Files'
- Alle `.csv` Dateien auf der SD-Karte können ausgelesen und runtergeladen werden.
