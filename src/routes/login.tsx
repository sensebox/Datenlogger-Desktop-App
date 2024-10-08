import { UserAuthForm } from "@/components/user-auth-form";
import osmLogo from "@/assets/openSenseMap.png";
export default function Login() {
  return (
    <div className="lg:p-8 p-8">
      <div className="mx-auto flex w-full flex-col items-center justify-center space-y-6 sm:w-[350px]">
        <img src={osmLogo} alt="Logo" className="my-4" />{" "}
        <p className="text-center">
          Um Daten auf die openSenseMap hochzuladen musst du dich mit deinem
          openSenseMap Account anmelden. Solltest du noch keinen Account haben
          erstelle dir einen auf der openSenseMap Website.
        </p>
        {/* Füge hier den Pfad zum Logo ein */}
        <UserAuthForm />
      </div>
    </div>
  );
}
