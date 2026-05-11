"use client";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { routes } from "@/lib/routes";
import { FormResetPasswordValues, resetPasswordSchema } from "@/lib/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function ResetPasswordForm({ token }: { token?: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (_values: FormResetPasswordValues) => {
    setLoading(true);
    // TODO: connect RESET_PASSWORD_MUTATION with token
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  if (!token) {
    return (
      <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500 text-center space-y-6">
        <div>
          <Logo className="mx-auto" width={72} height={72} />
          <p className="mt-4 font-semibold text-primary text-lg">Enlace inválido</p>
          <p className="text-sm text-gray-500 mt-1">
            El enlace de recuperación no es válido o ha expirado.
          </p>
        </div>
        <Link href={routes.autorization.forgotPassword}>
          <Button className="w-full bg-primary hover:bg-primary-light text-white h-11 transition-all duration-200 hover:shadow-md">
            Solicitar nuevo enlace
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="text-center mb-8">
        <Logo className="mx-auto" width={72} height={72} />
        <h2 className="mt-4 text-2xl font-bold text-primary">Nueva Contraseña</h2>
        <p className="mt-1 text-sm text-gray-500">
          Cree una contraseña segura para su cuenta
        </p>
        <div className="mt-4 mx-auto w-10 h-0.5 rounded-full bg-primary/40" />
      </div>

      {submitted ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
          <div className="flex flex-col items-center gap-3 py-2 text-center">
            <div className="size-14 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
              <CheckCircle2 className="size-7 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-primary">Contraseña actualizada</p>
              <p className="text-sm text-gray-500 mt-1 max-w-xs">
                Su contraseña ha sido restablecida correctamente. Ya puede
                iniciar sesión con sus nuevas credenciales.
              </p>
            </div>
          </div>
          <Link href={routes.autorization.signIn}>
            <Button className="w-full bg-primary hover:bg-primary-light text-white h-11 transition-all duration-200 hover:shadow-md active:scale-[0.98]">
              <KeyRound className="size-4 mr-2" />
              Iniciar sesión
            </Button>
          </Link>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-primary">
                    Nueva Contraseña <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative !mt-1">
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="Mínimo 8 caracteres"
                        className="bg-white border-gray-200 text-primary pr-11 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-200"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute size-8 flex justify-center items-center right-1 top-1/2 -translate-y-1/2 rounded-md text-gray-400 hover:text-primary hover:bg-gray-100 transition-all duration-150"
                      >
                        {showPassword ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-primary">
                    Confirmar Contraseña <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative !mt-1">
                      <Input
                        {...field}
                        type={showConfirm ? "text" : "password"}
                        placeholder="Repita su contraseña"
                        className="bg-white border-gray-200 text-primary pr-11 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-200"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute size-8 flex justify-center items-center right-1 top-1/2 -translate-y-1/2 rounded-md text-gray-400 hover:text-primary hover:bg-gray-100 transition-all duration-150"
                      >
                        {showConfirm ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-light text-white font-medium h-11 transition-all duration-200 hover:shadow-md active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>Restablecer Contraseña</span>
              )}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
}
