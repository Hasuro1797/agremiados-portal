"use client";
import DropdownAvatar from "@/components/DropdownAvatar";
import React, { Fragment } from "react";
import FormUpdateData from "../components/updatedata/FormUpdateData";
import { useQuery } from "@apollo/client";
import { GET_LAWYER_BY_ID } from "@/graphql/query/member.query";
import { CircleX, LoaderCircle } from "lucide-react";

export default function UpdateDataPageComponent() {
  const {
    data: lawyerData,
    loading: lawyerLoading,
    error: lawyerError,
  } = useQuery(GET_LAWYER_BY_ID, {
    fetchPolicy: "no-cache",
  });
  return (
    <div>
      <div className="relative w-full max-h-[220px] sm:max-h-[200px] overflow-hidden">
        <div className="absolute inset-0 bg-[url(/assets/singin-bg.jpg)] bg-cover bg-top"></div>
        <div className="relative pb-6 h-full pt-10 sm:pt-16 px-8 bg-header-gradient">
          <h1 className="text-[2.4rem] md:text-[56px] leading-[120%] text-white font-semibold">
            Bienvenido Colegiado
          </h1>
          <p className="text-secondary text-xl md:text-[26px] font-medium">
            Aquí podrás ver y actualizar tus datos{" "}
          </p>
        </div>
      </div>
      <div className="flex justify-end px-4 md:px-6 lg:px-10 py-6">
        <DropdownAvatar />
      </div>
      <section className="px-4 md:px-6 lg:px-10 xl:max-w-screen-2xl mx-auto">
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-primary">
            Actualiza tus datos
          </h2>
          <p className="md:text-lg">
            Antes de ingresar a la plataforma, es importante que tomes un
            momento para revisar y actualizar tus datos. Esto nos permitirá
            brindarte un mejor servicio y asegurar que toda la información esté
            al día para una experiencia óptima. ¡Gracias por tu colaboración!
          </p>
        </div>
        {lawyerError ? (
          <div className="w-full h-60 flex flex-col gap-2 justify-center items-center">
            <CircleX strokeWidth={2} className="size-12 text-red-500" />
            <span className="text-primary">Error al cargar los datos</span>
          </div>
        ) : (
          <Fragment>
            {lawyerLoading ? (
              <div className="w-full h-60 flex justify-center items-center">
                <LoaderCircle
                  strokeWidth={2}
                  className="text-blue-500 size-12 repeat-infinite animate-spin"
                />
              </div>
            ) : (
              <FormUpdateData lawyerData={lawyerData.findLayer} />
            )}
          </Fragment>
        )}
      </section>
    </div>
  );
}
