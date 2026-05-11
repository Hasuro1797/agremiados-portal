import { AuthBanner } from "../sign-in/components/AuthBanner";
import ResetPasswordForm from "./components/ResetPasswordForm";

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const { token } = searchParams;
  return (
    <main className="min-h-screen w-full flex bg-secondary">
      <section className="hidden lg:flex lg:w-1/2 relative">
        <AuthBanner />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
        <div className="relative w-full flex flex-col justify-end px-12 lg:px-16 pb-16">
          <div className="w-10 h-0.5 bg-white/60 rounded-full mb-5" />
          <h1 className="text-3xl lg:text-4xl font-bold text-white 2xl:max-w-lg mb-4 text-balance leading-tight">
            Restablece tu contraseña
          </h1>
          <p className="text-sm text-white/75 max-w-md leading-relaxed">
            Cree una nueva contraseña segura para proteger el acceso a su
            cuenta en el portal del agremiado.
          </p>
        </div>
      </section>
      <section className="w-full lg:w-1/2 bg-secondary flex items-center justify-center p-6 lg:p-12">
        <ResetPasswordForm token={token} />
      </section>
    </main>
  );
}
