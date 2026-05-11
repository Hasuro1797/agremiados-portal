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
import { FORGOT_PASSWORD_MUTATION } from "@/graphql/mutation/auth.mutation";
import { routes } from "@/lib/routes";
import { forgotPasswordSchema, FormForgotPasswordValues } from "@/lib/zod";
import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";

export default function ForgotPasswordForm() {
  const [forgotPassword, { error, loading, called, data }] = useMutation(
    FORGOT_PASSWORD_MUTATION,
    {
      fetchPolicy: "network-only",
    },
  );

  const form = useForm<FormForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { document: "" },
  });

  const onSubmit = async (data: FormForgotPasswordValues) => {
    await forgotPassword({
      variables: {
        input: {
          identifier: data.document,
        },
      },
    });
  };

  return (
    <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="text-center mb-8">
        <Logo className="mx-auto" width={72} height={72} />
        <h2 className="mt-4 text-2xl font-bold text-primary">
          Recuperar Contraseña
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Ingrese su número de documento para continuar
        </p>
        <div className="mt-4 mx-auto w-10 h-0.5 rounded-full bg-primary/40" />
      </div>

      {data ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
          <div className="flex flex-col items-center gap-3 py-2 text-center">
            <div className="size-14 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
              <CheckCircle2 className="size-7 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-primary">Solicitud enviada</p>
              <p className="text-sm text-gray-500 mt-1 max-w-xs">
                {data.forgotPassword.message ||
                  "Si el número de documento es correcto, recibirás un correo con las instrucciones para restablecer tu contraseña."}
              </p>
            </div>
          </div>
          <Link href={routes.autorization.signIn}>
            <Button
              variant="ghost"
              className="w-full border-primary/30 text-primary hover:bg-primary/5 h-11 transition-all duration-200"
            >
              <ArrowLeft className="size-4 mr-2" />
              Volver al inicio de sesión
            </Button>
          </Link>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="document"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-primary">
                    Número de Documento <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative !mt-1">
                      <Input
                        {...field}
                        placeholder="Ingrese sus 8 dígitos"
                        maxLength={8}
                        className="bg-white border-gray-200 text-primary placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-200"
                      />
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={loading && called}
              className="w-full bg-primary hover:bg-primary-light text-white font-medium h-11 transition-all duration-200 hover:shadow-md active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  <span>Enviando...</span>
                </>
              ) : (
                <span>Enviar instrucciones</span>
              )}
            </Button>
            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2.5 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="size-4 mt-0.5 shrink-0" />
                <span>
                  {error.message ||
                    "Error al enviar la solicitud, intente nuevamente"}
                </span>
              </div>
            )}

            <Link
              href={routes.autorization.signIn}
              className="flex items-center justify-center gap-1.5 text-sm text-primary/60 hover:text-primary transition-colors duration-150 pt-1"
            >
              <ArrowLeft className="size-3.5" />
              Volver al inicio de sesión
            </Link>
          </form>
        </Form>
      )}
    </div>
  );
}
