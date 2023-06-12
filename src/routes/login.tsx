import { UserAuthForm } from "@/components/user-auth-form";

export default function Login() {
  return (
    <div className="lg:p-8">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <UserAuthForm />
      </div>
    </div>
  );
}
