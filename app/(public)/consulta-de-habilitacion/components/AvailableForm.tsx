"use client";
import { Button } from "@/components/ui/button";
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
import { GET_AVAILABLE_LAWYER_BY_CIP } from "@/graphql/query/member.query";
import { availableFormSchema, FormAvailableSchema } from "@/lib/zod";
import { useLazyQuery } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { LawyerInfo } from "./AvailableStateComponent";

export interface Props {
  handleSetLawyerInfo: (lawyerInfo: LawyerInfo | null) => void;
}

export default function AvailableForm({ handleSetLawyerInfo }: Props) {
  const [getAvailableLawyerById, { loading }] = useLazyQuery(
    GET_AVAILABLE_LAWYER_BY_CIP,
    {
      fetchPolicy: "no-cache",
      onError: (error) => {
        toast.error(error?.message, {
          description: "Por favor intenta nuevamente más tarde",
          classNames: {
            icon: "text-red-500",
            title: "text-primary",
            description: "text-primary",
            toast: "bg-secondary",
          },
        });
        handleSetLawyerInfo(null);
      },
      onCompleted: (data) => {
        handleSetLawyerInfo(data.availableLawyerRequest);
      },
    },
  );
  //Form
  const form = useForm<FormAvailableSchema>({
    resolver: zodResolver(availableFormSchema),
    defaultValues: {
      document: "",
    },
  });

  const onSubmit = async (values: FormAvailableSchema) => {
    try {
      await getAvailableLawyerById({
        variables: {
          cip: values.document,
        },
      });
    } catch (error) {
      console.error("Error al consultar habilitación", error);
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
          Consulta de Habilitados
        </h2>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <FormField
            control={form.control}
            name="document"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-primary">
                  N° de Matrícula <span className="text-red-600">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Ingrese su número de matricula"
                    className=" bg-gray-100 border-gray-300 text-primary !mt-1"
                    maxLength={6}
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
            <span>Consultar</span>
          </Button>
        </form>
      </Form>
    </div>
  );
}
