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
import { SIGN_IN_MUTATION } from "@/graphql/mutation/auth.mutation";
import { setAccessTokenCookie, setRefreshTokenCookie } from "@/lib/cookies";
import { routes } from "@/lib/routes";
import { accesssFormSchema, FormAccessValues } from "@/lib/zod";
import { useUserStore } from "@/providers/user-provider";
import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function AccessFormIn({
  redirect,
}: {
  redirect: string | undefined;
}) {
  const { setInfo } = useUserStore((state) => state);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [signIn, { loading, error }] = useMutation(SIGN_IN_MUTATION, {
    fetchPolicy: "no-cache",
    onCompleted: (data) => {
      console.log("Datos de inicio de sesión:", data);
      const { access_token, refresh_token, user } = data.signinMember;
      setInfo(user);
      setAccessTokenCookie(access_token);
      setRefreshTokenCookie(refresh_token);
      console.log("Redirigiendo a:", redirect || "/");
      router.push(redirect || "/");
    },
  });

  const form = useForm<FormAccessValues>({
    resolver: zodResolver(accesssFormSchema),
    defaultValues: {
      user: "",
      password: "",
    },
  });

  const onSubmit = async (values: FormAccessValues) => {
    try {
      await signIn({
        variables: {
          input: {
            identifier: values.user,
            password: values.password,
          },
        },
      });
    } catch (error) {
      console.error("Error al iniciar sesión", error);
    }
  };

  return (
    <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="text-center mb-8">
        <Logo className="mx-auto" width={72} height={72} />
        <h2 className="mt-4 text-2xl font-bold text-primary">Iniciar Sesión</h2>
        <p className="mt-1 text-sm text-gray-500">
          Ingrese sus credenciales para acceder
        </p>
        <div className="mt-4 mx-auto w-10 h-0.5 rounded-full bg-primary/40" />
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="user"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-primary">
                  Número de Documento <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Ingrese su número de documento"
                    className="!mt-1 bg-white border-gray-200 text-primary placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-200"
                    maxLength={8}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="text-sm font-medium text-primary">
                    Contraseña <span className="text-red-500">*</span>
                  </FormLabel>
                  <Link
                    href={routes.autorization.forgotPassword}
                    className="text-xs text-primary/60 hover:text-primary transition-colors duration-150 hover:underline underline-offset-2"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <FormControl>
                  <div className="relative !mt-1">
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="bg-white border-gray-200 text-primary pr-11 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute size-8 flex justify-center items-center right-1 top-1/2 -translate-y-1/2 rounded-md text-gray-400 hover:text-primary hover:bg-gray-100 transition-all duration-150"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <Eye className="size-4" />
                      ) : (
                        <EyeOff className="size-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2.5 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="size-4 mt-0.5 shrink-0" />
              <span>
                {error.message || "Error al iniciar sesión, intente nuevamente"}
              </span>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-light text-white font-medium h-11 transition-all duration-200 hover:shadow-md active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                <span>Ingresando...</span>
              </>
            ) : (
              <span>Acceder al Portal</span>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
