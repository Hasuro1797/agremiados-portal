"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormUpdateDataSchema, updateDataFormSchema } from "@/lib/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  // Eye,
  // EyeOff,
  Loader,
} from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
// import ScrollAreaTerms from "./ScrollAreaTerms";
import { useMutation, useQuery } from "@apollo/client";
import { GET_LOCATION_QUERY } from "@/graphql/query/location.query";
import { get } from "lodash";
import { LawyerApi } from "@/types/lawyer.type";
import { UPDATE_LAWYER_MUTATION } from "@/graphql/mutation/lawyer.mutation";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

interface FormUpdateDataProps {
  lawyerData: LawyerApi;
}

export default function FormUpdateData({ lawyerData }: FormUpdateDataProps) {
  // const [showPassword, setShowPassword] = useState(false);
  // const [openTerms, setOpenTerms] = useState(false);
  // const [canAccept, setCanAccept] = useState(false);
  const [idsValues, setIdsValues] = useState({
    id_address: "",
    id_person: "",
    id_district: "",
  });

  const [isCorrect, setIsCorrect] = useState({
    name: true,
    paternal_surname: true,
    maternal_surname: true,
    password: true,
  });
  const router = useRouter();
  const { data: locationData, loading } = useQuery(GET_LOCATION_QUERY);
  const [updatedataLawyer, { loading: updateDataLawyerLoading }] = useMutation(
    UPDATE_LAWYER_MUTATION,
    {
      onCompleted: () => {
        toast.success("Datos actualizados correctamente", {
          classNames: {
            icon: "text-green-500",
            title: "text-primary",
          },
        });
        router.push("/");
      },
    }
  );

  const locationMap = useMemo(() => {
    interface Location {
      Pais: string;
      Departamento: string;
      Provincia: string;
      Distrito: string;
      IdDistrito: string;
    }

    interface LocationMap {
      [pais: string]: {
        [departamento: string]: {
          [provincia: string]: { Distrito: string; IdDistrito: string }[];
        };
      };
    }

    const locationMap: LocationMap = get(
      locationData,
      "getLocations",
      []
    ).reduce((acc: LocationMap, location: Location) => {
      const { Pais, Departamento, Provincia, Distrito, IdDistrito } = location;
      if (!acc[Pais]) acc[Pais] = {};
      if (!acc[Pais][Departamento]) acc[Pais][Departamento] = {};
      if (!acc[Pais][Departamento][Provincia])
        acc[Pais][Departamento][Provincia] = [];

      acc[Pais][Departamento][Provincia].push({ Distrito, IdDistrito });

      return acc;
    }, {});
    return locationMap;
  }, [locationData]);

  const form = useForm<FormUpdateDataSchema>({
    resolver: zodResolver(updateDataFormSchema),
    defaultValues: {
      name: "",
      paternal_surname: "",
      maternal_surname: "",
      password: "",
      email: "",
      phone: "",
      address: "",
      district: "",
      country: "",
      department: "",
      province: "",
    },
  });

  useEffect(() => {
    if (lawyerData) {
      const { id_address, id_person, id_district, ...rest } = lawyerData;
      const initialData = {
        ...rest,
        password: rest.dni,
        country: rest.country ?? "",
        department: rest.department ?? "",
        province: rest.province ?? "",
        district: rest.district ?? "",
        phone: rest.phone ?? "",
        email: rest.email ?? "",
        address: rest.address ?? "",
      };
      setIdsValues({ id_address, id_person, id_district });
      form.reset(initialData);
    }
  }, [lawyerData, form]);
  const onSubmit = async (data: FormUpdateDataSchema) => {
    const { aceptTerms, country, department, province, ...restData } = data;
    const resultado = locationMap[country][department][province].find(
      (distrito) => distrito.Distrito === data.district
    );
    try {
      await updatedataLawyer({
        variables: {
          updateLayerInput: {
            ...restData,
            password: data.password,
            id_address: idsValues.id_address,
            id_person: idsValues.id_person,
            id_district: resultado?.IdDistrito || "",
            province,
            department,
            country,
            district: data.district,
            acepted_terms: aceptTerms,
          },
        },
      });
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error al actualizar los datos", {
        description: "Por favor, intenta nuevamente",
        classNames: {
          icon: "text-red-500",
          title: "text-primary",
        },
      });
    }
  };
  // const togglePassword = () => {
  //   setShowPassword(!showPassword);
  // };
  return (
    <div className="w-full">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full md:max-w-[550px] mx-auto lg:max-w-full py-8 space-y-8 px-2"
        >
          <div className="flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-8">
            <div className="w-full lg:w-3/5 space-y-4 md:space-y-6 lg:space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="lg:text-base">
                      Nombres Completos <span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className=" bg-gray-100 border-gray-300 w-full"
                        disabled={isCorrect.name}
                      />
                    </FormControl>
                    <FormDescription className="bg-secondary max-w-max px-3 py-2 space-x-2 rounded-lg">
                      <span className="text-primary">
                        ¿El dato es correcto?
                      </span>
                      <Button
                        type="button"
                        size={"sm"}
                        variant={isCorrect.name ? "default" : "outline"}
                        className={`${
                          isCorrect.name
                            ? "bg-[#26388F] hover:bg-[#006FFD]"
                            : "text-[#006FFD] border-[#26388F]"
                        }`}
                        onClick={() =>
                          setIsCorrect((prev) => ({
                            ...prev,
                            name: true,
                          }))
                        }
                      >
                        Sí
                      </Button>
                      <Button
                        type="button"
                        size={"sm"}
                        variant={!isCorrect.name ? "default" : "outline"}
                        className={`${
                          !isCorrect.name
                            ? "bg-[#26388F] hover:bg-[#006FFD]"
                            : "text-[#006FFD] border-[#26388F]"
                        }`}
                        onClick={() =>
                          setIsCorrect((prev) => ({
                            ...prev,
                            name: false,
                          }))
                        }
                      >
                        No
                      </Button>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
                <FormField
                  control={form.control}
                  name="paternal_surname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="lg:text-base">
                        Apellido Paterno <span className="text-red-600">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className=" bg-gray-100 border-gray-300"
                          disabled={isCorrect.paternal_surname}
                        />
                      </FormControl>
                      <FormDescription className="bg-secondary max-w-max px-3 py-2 flex gap-2 flex-wrap items-center rounded-lg">
                        <span className="text-primary">
                          ¿El dato es correcto?
                        </span>
                        <span className="space-x-2">
                          <Button
                            type="button"
                            size={"sm"}
                            variant={
                              isCorrect.paternal_surname ? "default" : "outline"
                            }
                            className={`${
                              isCorrect.paternal_surname
                                ? "bg-[#26388F] hover:bg-[#006FFD]"
                                : "text-[#006FFD] border-[#26388F]"
                            }`}
                            onClick={() =>
                              setIsCorrect((prev) => ({
                                ...prev,
                                paternal_surname: true,
                              }))
                            }
                          >
                            Sí
                          </Button>
                          <Button
                            type="button"
                            size={"sm"}
                            variant={
                              !isCorrect.paternal_surname
                                ? "default"
                                : "outline"
                            }
                            className={`${
                              !isCorrect.paternal_surname
                                ? "bg-[#26388F] hover:bg-[#006FFD]"
                                : "text-[#006FFD] border-[#26388F]"
                            }`}
                            onClick={() =>
                              setIsCorrect((prev) => ({
                                ...prev,
                                paternal_surname: false,
                              }))
                            }
                          >
                            No
                          </Button>
                        </span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maternal_surname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="lg:text-base">
                        Apellido Materno <span className="text-red-600">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className=" bg-gray-100 border-gray-300"
                          disabled={isCorrect.maternal_surname}
                        />
                      </FormControl>
                      <FormDescription className="bg-secondary max-w-max px-3 py-2 flex gap-2 flex-wrap items-center rounded-lg">
                        <span className="text-primary">
                          ¿El dato es correcto?
                        </span>
                        <span className="space-x-2">
                          <Button
                            type="button"
                            size={"sm"}
                            variant={
                              isCorrect.maternal_surname ? "default" : "outline"
                            }
                            className={`${
                              isCorrect.maternal_surname
                                ? "bg-[#26388F] hover:bg-[#006FFD]"
                                : "text-[#006FFD] border-[#26388F]"
                            }`}
                            onClick={() =>
                              setIsCorrect((prev) => ({
                                ...prev,
                                maternal_surname: true,
                              }))
                            }
                          >
                            Sí
                          </Button>
                          <Button
                            type="button"
                            size={"sm"}
                            variant={
                              !isCorrect.maternal_surname
                                ? "default"
                                : "outline"
                            }
                            className={`${
                              !isCorrect.maternal_surname
                                ? "bg-[#26388F] hover:bg-[#006FFD]"
                                : "text-[#006FFD] border-[#26388F]"
                            }`}
                            onClick={() =>
                              setIsCorrect((prev) => ({
                                ...prev,
                                maternal_surname: false,
                              }))
                            }
                          >
                            No
                          </Button>
                        </span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="relative space-y-2">
                      <FormLabel className="lg:text-base">
                        Contraseña <span className="text-red-600">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          className="pr-10 bg-gray-100 border-gray-300"
                          disabled={isCorrect.password}
                          {...field}
                        />
                      </FormControl>
                      <button
                        type="button"
                        className="absolute top-6 rounded h-10 right-0 w-10 flex items-center justify-center px-2 "
                        onClick={togglePassword}
                      >
                        {showPassword ? (
                          <Eye strokeWidth={2} className="size-4" />
                        ) : (
                          <EyeOff strokeWidth={2} className="size-4" />
                        )}
                      </button>
                    </div>
                    <FormDescription className="bg-secondary max-w-max px-3 py-2 space-x-2 rounded-lg">
                      <span className="text-primary">
                        ¿Mantendrás tu contraseña?
                      </span>
                      <Button
                        type="button"
                        size={"sm"}
                        variant={isCorrect.password ? "default" : "outline"}
                        className={`${
                          isCorrect.password
                            ? "bg-[#26388F] hover:bg-[#006FFD]"
                            : "text-[#006FFD] border-[#26388F]"
                        }`}
                        onClick={() =>
                          setIsCorrect((prev) => ({
                            ...prev,
                            password: true,
                          }))
                        }
                      >
                        Sí
                      </Button>
                      <Button
                        type="button"
                        size={"sm"}
                        variant={!isCorrect.password ? "default" : "outline"}
                        className={`${
                          !isCorrect.password
                            ? "bg-[#26388F] hover:bg-[#006FFD]"
                            : "text-[#006FFD] border-[#26388F]"
                        }`}
                        onClick={() =>
                          setIsCorrect((prev) => ({
                            ...prev,
                            password: false,
                          }))
                        }
                      >
                        No
                      </Button>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
            </div>
            <div className="w-full lg:w-2/5 space-y-4 md:space-y-6 lg:space-y-8">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="lg:text-base">
                      Correo electrónico <span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        className=" bg-gray-100 border-gray-300"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="lg:text-base">
                      Número de celular <span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        maxLength={9}
                        className=" bg-gray-100 border-gray-300"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="lg:text-base">
                      Dirección <span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className=" bg-gray-100 border-gray-300"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
                {loading ? (
                  <Fragment>
                    <Skeleton className="w-full h-10" />
                    <Skeleton className="w-full h-10" />
                  </Fragment>
                ) : (
                  <Fragment>
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem key={field.value}>
                          <FormLabel>País</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              setIdsValues((prev) => ({
                                ...prev,
                                id_district: "",
                              }));
                              form.setValue("department", "");
                              form.setValue("province", "");
                              form.setValue("district", "");
                            }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="focus:ring-primary">
                                <SelectValue placeholder="Seleccione un país" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.keys(locationMap).map((country) => (
                                <SelectItem key={country} value={country}>
                                  {country}
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
                      name="department"
                      render={({ field }) => (
                        <FormItem key={field.value}>
                          <FormLabel>Departamento</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              setIdsValues((prev) => ({
                                ...prev,
                                id_district: "",
                              }));
                              form.setValue("province", "");
                              form.setValue("district", "");
                            }}
                            defaultValue={field.value}
                            disabled={!form.watch("country")}
                          >
                            <FormControl>
                              <SelectTrigger className="focus:ring-primary">
                                <SelectValue placeholder="Seleccione un departamento" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {form.watch("country") &&
                                Object.keys(
                                  locationMap[form.watch("country")] || {}
                                ).map((department) => (
                                  <SelectItem
                                    key={department}
                                    value={department}
                                  >
                                    {department}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Fragment>
                )}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
                {loading ? (
                  <Fragment>
                    <Skeleton className="w-full h-10" />
                    <Skeleton className="w-full h-10" />
                  </Fragment>
                ) : (
                  <Fragment>
                    <FormField
                      control={form.control}
                      name="province"
                      render={({ field }) => (
                        <FormItem key={field.value}>
                          <FormLabel>Provincia</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              setIdsValues((prev) => ({
                                ...prev,
                                id_district: "",
                              }));
                              form.setValue("district", "");
                            }}
                            defaultValue={field.value}
                            disabled={!form.watch("department")}
                          >
                            <FormControl>
                              <SelectTrigger className="focus:ring-primary">
                                <SelectValue placeholder="Seleccione una provincia" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {form.watch("country") &&
                                form.watch("department") &&
                                Object.keys(
                                  locationMap[form.watch("country")][
                                    form.watch("department")
                                  ] || {}
                                ).map((province) => (
                                  <SelectItem key={province} value={province}>
                                    {province}
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
                      name="district"
                      render={({ field }) => (
                        <FormItem key={field.value}>
                          <FormLabel>Distrito</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            disabled={!form.watch("province")}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="focus:ring-primary">
                                <SelectValue placeholder="Seleccione un distrito" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {form.watch("country") &&
                                form.watch("department") &&
                                form.watch("province") &&
                                locationMap[form.watch("country")][
                                  form.watch("department")
                                ][form.watch("province")]?.map((district) => {
                                  return (
                                    <SelectItem
                                      key={district.IdDistrito}
                                      value={district.Distrito}
                                    >
                                      {district.Distrito}
                                    </SelectItem>
                                  );
                                })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Fragment>
                )}
              </div>
            </div>
          </div>
          <FormField
            control={form.control}
            name="aceptTerms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 lg:max-w-[700px]">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    // className={`${field.value ? "block" : "hidden"}`}
                    // disabled={!canAccept}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    He leído y acepto los términos y condiciones
                    {/* <Dialog
                      open={openTerms}
                      onOpenChange={(open) => {
                        setOpenTerms(open);
                        if (!open) setCanAccept(false);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          variant={"link"}
                          className="p-0 text-blue-500 hover:underline !h-auto"
                        >
                          términos y condiciones
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px] md:max-w-[700px] lg:max-w-[900px]">
                        <DialogHeader>
                          <DialogTitle>Términos y Condiciones</DialogTitle>
                          <DialogDescription>
                            Por favor, lee nuestros términos y condiciones.
                            Debes llegar al final para poder aceptarlos.
                          </DialogDescription>
                        </DialogHeader>
                        <ScrollAreaTerms setCanAccept={setCanAccept} />
                        <DialogFooter>
                          <FormField
                            control={form.control}
                            name="aceptTerms"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={(checked) => {
                                      field.onChange(checked);
                                      if (checked) setOpenTerms(false);
                                    }}
                                    disabled={!canAccept}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>
                                    Acepto los términos y condiciones
                                  </FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                        </DialogFooter>
                      </DialogContent>
                    </Dialog> */}
                  </FormLabel>
                  <FormDescription>
                    Debes leer y aceptar los términos y condiciones
                    <p>
                      Los datos personales serán protegidos conforme a las leyes
                      vigentes peruanas y los tratados internacionales
                      aplicables para uso de datos personales
                    </p>
                  </FormDescription>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <div className="w-full flex justify-start lg:justify-end items-center">
            <Button
              type="submit"
              className="flex gap-2 bg-primary w-full lg:w-auto hover:bg-[#006FFD] text-white"
            >
              {updateDataLawyerLoading && (
                <Loader
                  strokeWidth={2}
                  className="size-4 animate-spin repeat-infinite"
                />
              )}
              <span className="">Guardar</span>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
