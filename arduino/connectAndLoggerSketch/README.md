### Kurzbeschreibung

Der Sketch liest jede Sekunde:

- Temperatur & Luftfeuchte vom HDC1080
- GPS-Position und -Zeit vom BN-880

Er formatiert die Daten als CSV-Zeilen und speichert sie in fortlaufenden Dateien (`00000001.csv`, …) auf der microSD-Karte.

### App-Interaktion

Über die Bibliothek **SerialSDManager** kommuniziert der Sketch per USB-Seriell mit deiner Desktop/Tauri-App, um z. B.:

- vorhandene Log-Dateien aufzulisten und herunterzuladen
- neue Dateinamen für die SD zu generieren
- die `.cfg`-Konfiguration auf der SD zu ändern
