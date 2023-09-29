import { useState } from "react";
import storage from "@/lib/local-storage";
import { toast } from "@/components/ui/use-toast";

interface LoginResponse {
  // Definiere die Struktur der Login-Antwort hier
  // Zum Beispiel:
  code: number;
  message: string;
  token: string;
  refreshToken: string;
  data: {
    user: {
      name: string;
      email: string;
      role: string;
      language: string;
      emailIsConfirmed: boolean;
      boxes: string[];
    };
  };
}

const useOpenSenseMapLogin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    try {
      // Hier fügst du den Code zum Einloggen bei der OpenSenseMap-API ein
      // Dieser Code sollte die Anfrage an die API senden und die Antwort verarbeiten

      // Beispiel:
      const response = await fetch(
        "https://api.opensensemap.org/users/sign-in",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      if (response.ok) {
        const loginResponse: LoginResponse = await response.json();

        // Speichere die Login-Antwort im localStorage
        storage.set("loginToken", loginResponse.token);
        storage.set("refreshToken", loginResponse.refreshToken);
        storage.set("timestamp", Date.now());

        storage.set("signInResponse", loginResponse);
        toast({
          title: "Login erfolgreich",
          description: "Du wurdest erfolgreich eingeloggt",
        });

        // Setze den Status auf eingeloggt
        setIsLoggedIn(true);
      } else {
        setError("Fehler beim Einloggen");
      }
    } catch (error: any) {
      setError("Fehler beim Einloggen: " + error.message);
    }
  };
  const logout = () => {
    // Hier kannst du den Code zum Ausloggen implementieren
    // Du kannst den localStorage-Eintrag auch löschen, um den Benutzer auszuloggen
    storage.remove("loginToken");
    storage.remove("signInResponse");
    setIsLoggedIn(false);
    toast({
      title: "Logout erfolgreich",
      description: "Du wurdest erfolgreich ausgeloggt",
    });
  };

  const getAllUserBoxes = async () => {
    try {
      // @ts-ignore
      const authorization = storage.get("loginToken");
      const response = await fetch(
        "https://api.opensensemap.org/users/me/boxes",
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + authorization,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const userResponse = await response.json();
        return userResponse.data.boxes;
      } else {
        setError("Fehler beim Abrufen der Benutzer-Boxen");
      }
    } catch (error: any) {
      setError("Fehler beim Abrufen der Benutzer-Boxen: " + error.message);
    }
  };

  const refreshToken = async () => {
    const refreshToken = storage.get("refreshToken");
    const response = await fetch(
      "https://api.opensensemap.org/users/refresh-auth",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: refreshToken,
        }),
      }
    );

    if (response.ok) {
      const loginResponse: LoginResponse = await response.json();
      storage.set("loginToken", loginResponse.token);
      storage.set("refreshToken", loginResponse.refreshToken);
      storage.set("timestamp", Date.now());
    }
  };

  return { isLoggedIn, error, login, logout, getAllUserBoxes, refreshToken };
};

export default useOpenSenseMapLogin;
