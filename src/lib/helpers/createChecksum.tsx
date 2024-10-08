export const createChecksum = (str: string) => {
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    // Verwende einen einfachen Hashing-Mechanismus
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash; // Auf 32-Bit begrenzen
  }

  // Wandelt den Hash in eine hexadezimale Darstellung um
  let hexHash = Math.abs(hash).toString(16).toUpperCase();

  // Falls der Hash weniger als 8 Zeichen hat, führen wir das Hash-Verfahren erneut durch
  if (hexHash.length > 8) {
    hexHash = hexHash.substring(0, 8);
  } else if (hexHash.length < 8) {
    // Iteriere weiter über den String, um die Länge von 8 zu erreichen
    let additionalHash = 0;
    for (let i = 0; i < str.length; i++) {
      additionalHash =
        (additionalHash << 5) - additionalHash + str.charCodeAt(i);
    }
    let additionalHex = Math.abs(additionalHash).toString(16).toUpperCase();

    // Füge so viel von der zusätzlichen Berechnung hinzu, wie nötig ist, um auf 8 Zeichen zu kommen
    hexHash += additionalHex.substring(0, 8 - hexHash.length);
  }

  return hexHash;
};
