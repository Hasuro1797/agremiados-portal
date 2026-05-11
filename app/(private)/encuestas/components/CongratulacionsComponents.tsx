"use client";
import LayoutComponent from "@/components/LayoutComponent";
import TitleHeader from "@/components/TitleHeader";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CREATE_SUPPORT } from "@/graphql/mutation/support.mutation";
import { FormOpinionValues, opinionValues } from "@/lib/zod";
import { personalArea, placeList, topicList } from "@/utils/resources";
import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function CongratulacionsComponents() {
  const [topicState, setTopicState] = React.useState("");
  const [createOpinion, { loading }] = useMutation(CREATE_SUPPORT, {
    onCompleted: () => {
      toast.success("Formulario enviado exitosamente", {
        position: "top-center",
        classNames: {
          toast: "bg-background",
          icon: "text-green-500",
          title: "text-foreground",
          description: "text-foreground",
        },
      });
    },
    onError: (error) => {
      console.error(error);
      toast.error("Error al enviar el formulario", {
        description: "Por favor, inténtelo de nuevo",
        classNames: {
          toast: "bg-background",
          icon: "text-red-500",
          title: "text-foreground",
          description: "text-foreground",
        },
      });
    },
  });
  const form = useForm<FormOpinionValues>({
    resolver: zodResolver(opinionValues),
    defaultValues: {
      comment: "",
      details: "",
      place: "",
      topic: "",
      worker: "",
      workerName: "",
    },
  });

  async function handleSubmit(values: FormOpinionValues) {
    try {
      await createOpinion({
        variables: {
          createSupportInput: values,
        },
      });
      form.reset({
        comment: "",
        details: "",
        place: "",
        topic: "",
        worker: "",
        workerName: "",
      });
      setTopicState("");
    } catch (e) {
      console.error(e);
    }
  }
  return (
    <LayoutComponent>
      <TitleHeader subTitle="Encuesta del Personal" />
      <div className="py-10 mx-auto max-w-[750px]">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col justify-center px-1"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="place"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <Label htmlFor="place" className="flex-1 w-full">
                      ¿En qué lugar se sucito?{" "}
                      <span className="text-red-600">*</span>
                    </Label>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="focus:ring-primary">
                          <SelectValue placeholder="Selecciona una opción..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {placeList.map((place) => (
                          <SelectItem key={place.id} value={place.value}>
                            {place.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <Label htmlFor="topic" className="leading-[120%] w-full">
                      Selecciona el área correspondiente para tu queja,
                      sugerencia o felicitación{" "}
                      <span className="text-red-600">*</span>
                    </Label>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        setTopicState(value);
                        if (value === "Personal") {
                          form.setValue("comment", "");
                        } else {
                          form.setValue("worker", "");
                          form.setValue("workerName", "");
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className="focus:ring-primary">
                          <SelectValue placeholder="Selecciona una opción..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {topicList.map((topic) => (
                          <SelectItem key={topic.id} value={topic.value}>
                            {topic.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {topicState === "Personal" && (
                <FormField
                  control={form.control}
                  name="worker"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2 items-start flex flex-col sm:flex-row sm:gap-6">
                      <Label
                        htmlFor="worker"
                        className="w-full sm:w-1/2 leading-[120%]"
                      >
                        Selecciona al trabajador sobre quien deseas hacer una
                        recomendación, felicitacion o presentar una queja
                      </Label>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="focus:ring-primary sm:!mt-0 w-full sm:w-1/2">
                            <SelectValue placeholder="Selecciona una opción..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {personalArea.map((topic) => (
                            <SelectItem key={topic.id} value={topic.value}>
                              {topic.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {topicState === "Personal" && (
                <FormField
                  control={form.control}
                  name="workerName"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2 flex flex-col sm:flex-row sm:gap-6">
                      <Label
                        htmlFor="workerName"
                        className="w-full sm:w-1/2 leading-[120%]"
                      >
                        Ingrese el nombre de la persona si lo recuerda
                      </Label>
                      <FormControl>
                        <Input
                          id="workerName"
                          placeholder="Alex Ponce"
                          autoComplete=""
                          className="w-full sm:w-1/2 sm:!mt-0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {topicState === "Infraestructura" && (
                <FormField
                  control={form.control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <Label htmlFor="comment" className="leading-[120%]">
                        ¿Has notado algún problema en la infraestructura de
                        nuestras instalaciones? (Ejemplo: suciedad,
                        filtraciones, iluminación insuficiente, entre otros).
                        Por favor, describe el problema y su ubicación.
                      </Label>
                      <FormControl>
                        <Textarea
                          placeholder="Describe Agrega una descripción"
                          className="resize-none min-h-[120px] focus-visible:ring-primary"
                          id="comment"
                          maxLength={200}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Máximo 200 caracteres
                      </FormDescription>
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="details"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <Label htmlFor="details" className="leading-[120%]">
                      Describe con más detalle lo ocurrido y comparte alguna
                      sugerencia para mejorar{" "}
                      <span className="text-red-600">*</span>
                    </Label>
                    <FormControl>
                      <Textarea
                        id="details"
                        placeholder="Agrega una descripción"
                        className="resize-none min-h-[150px] focus-visible:ring-primary"
                        maxLength={300}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Máximo 300 caracteres
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="sm:col-span-2 flex justify-end ">
                <Button
                  disabled={loading}
                  type="submit"
                  className="bg-blue-600 sm:max-w-[160px] w-full text-white hover:bg-blue-500 font-semibold flex gap-1"
                >
                  {loading && (
                    <Loader
                      strokeWidth={2}
                      className="animate-spin repeat-infinite !size-4"
                    />
                  )}
                  <span>Guardar</span>
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </LayoutComponent>
  );
}
