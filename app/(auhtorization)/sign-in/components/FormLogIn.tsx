"use client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
/* eslint-disable @next/next/no-img-element */
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { FIRST_SIGNIN_MUTATION } from "@/graphql/mutation/auth.mutation";
import {
  getDataFromToken,
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from "@/lib/cookies";
import { cn } from "@/lib/utils";
import { FormSignInValues, loginFormSchema } from "@/lib/zod";
import { useUserStore } from "@/providers/user-provider";
import { JWTData } from "@/types/auth.type";
import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { get } from "lodash";
import { CalendarIcon, CircleX, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

export default function FormLogIn() {
  const [month, setMonth] = useState<Date>(new Date());
  const { setInfo } = useUserStore((state) => state);
  const router = useRouter();
  const [firstSignin, { loading, error }] = useMutation(FIRST_SIGNIN_MUTATION, {
    fetchPolicy: "no-cache",
    onCompleted: (data) => {
      const { access_token, refresh_token } = data.firstSignInLayer;
      const { id, last_name, name, hasRegistered } = getDataFromToken(
        get(data, "firstSignInLayer.access_token", ""),
      ) as JWTData;
      setInfo(name, last_name, hasRegistered, id);
      setAccessTokenCookie(access_token);
      setRefreshTokenCookie(refresh_token);
      router.push("/update-data");
    },
  });
  //Form
  const form = useForm<FormSignInValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      user: "",
      password: "",
    },
  });

  const years = useMemo(
    () => Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i),
    [],
  );

  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const onSubmit = async (values: FormSignInValues) => {
    try {
      await firstSignin({
        variables: {
          signInLayerInput: {
            cip: values.user,
            password: values.password,
            dateOfBirth: values.birthDay,
          },
        },
      });
    } catch (error) {
      console.error("Error al iniciar sesión", error);
    }
  };
  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <img
          src="/assets/logos/logo-caa-hor.png"
          width={194}
          alt="Logo"
          className="w-[180px] sm:w-[220px] mx-auto"
        />
        <h2 className="text-center text-3xl font-bold mt-4 text-primary">
          Actualizar Datos
        </h2>
        <p className="mt-2 text-gray-600">
          Ingrese sus credenciales para acceder
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="user"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary">
                    Usuario - Matricula <span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ingrese su número de matricula"
                      className=" bg-gray-100 border-gray-300 text-primary !mt-1"
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    {
                      "Ingrese su número de matrícula asegurándose de completar 6 dígitos. Si su matrícula tiene menos de 6 dígitos, llene con ceros al inicio (ejemplo: 001234)"
                    }
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary">
                    Contraseña - DNI <span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ingrese su número de matricula"
                      className=" bg-gray-100 border-gray-300 text-primary !mt-1"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="birthDay"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel className="text-primary">
                    Fecha de nacimiento <span className="text-red-500">*</span>
                  </FormLabel>
                  <div className="!mt-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-primary justify-start mt-1 bg-slate-100 border-slate-300  text-left hover:bg-slate-200",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            {field.value ? (
                              <span className="text-primary w-full">
                                {format(field.value, "PPP", {
                                  locale: es,
                                })}
                              </span>
                            ) : (
                              <span className="text-primary w-full">
                                Seleccione una fecha
                              </span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <div className="p-2 bg-secondary border-slate-200 space-y-2">
                          <div className="flex items-center justify-between gap-x-2">
                            <div className="flex space-x-2">
                              <Select
                                value={month.getMonth().toString()}
                                onValueChange={(value) =>
                                  setMonth(
                                    new Date(
                                      month.getFullYear(),
                                      parseInt(value),
                                    ),
                                  )
                                }
                              >
                                <SelectTrigger className="focus:ring-0 focus:ring-offset-0">
                                  {months[month.getMonth()]}
                                </SelectTrigger>
                                <SelectContent>
                                  {months.map((m, index) => (
                                    <SelectItem
                                      key={index}
                                      value={index.toString()}
                                      className="hover:bg-gray-100"
                                    >
                                      {m}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Select
                                value={month.getFullYear().toString()}
                                onValueChange={(value) =>
                                  setMonth(
                                    new Date(parseInt(value), month.getMonth()),
                                  )
                                }
                              >
                                <SelectTrigger className="w-24 focus:ring-0 focus:ring-offset-0">
                                  {month.getFullYear()}
                                </SelectTrigger>
                                <SelectContent>
                                  {years.map((year) => (
                                    <SelectItem
                                      key={year}
                                      value={year.toString()}
                                      className="hover:bg-gray-100"
                                    >
                                      {year}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            month={month}
                            onMonthChange={setMonth}
                            initialFocus
                            locale={es}
                            className="text-primary bg-white rounded-md border border-gray-200"
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <FormMessage className="tex-xs" />
                </FormItem>
              )}
            />
          </div>
          <Button
            type="submit"
            className="w-full text-white flex gap-2 hover:bg-blue-700 bg-primary"
          >
            {loading && (
              <Loader
                strokeWidth={2}
                className="size-4 animate-spin repeat-infinite"
              />
            )}
            <span>Acceder al Portal</span>
          </Button>
          {error && (
            <div className="bg-red-500 font-normal mt-6 text-sm p-2 gap-2 text-white rounded-lg tex-center flex items-center">
              <CircleX strokeWidth={2} className="size-4" />
              <span>
                {error.message || "Error al iniciar sesión, intente nuevamente"}
              </span>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
