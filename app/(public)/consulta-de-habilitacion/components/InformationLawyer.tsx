import React from "react";
import { LawyerInfo } from "./AvailableStateComponent";
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export interface InformationLawyerProps {
  lawyerInfo: LawyerInfo | null;
}
export default function InformationLawyer({
  lawyerInfo,
}: InformationLawyerProps) {
  return lawyerInfo ? (
    <div className="w-full max-w-md p-4 mt-5 rounded-lg shadow-md bg-white">
      <div className="flex gap-4 items-center justify-between">
        <div>
          <p className="text-lg font-semibold">{lawyerInfo?.name}</p>
          <p
            className={`text-sm ${
              lawyerInfo?.active
                ? "text-green-600 border-green-600"
                : "text-red-600 border-red-600"
            } border rounded-full max-w-max px-2 py-1 my-3`}
          >
            {lawyerInfo?.condition_message}
          </p>
          <ul className="text-sm text-gray-500">
            <li>N° de matrícula: {lawyerInfo?.cip}</li>
            <li>Estado: {lawyerInfo?.collegiate_status}</li>
            <li>Vive: {lawyerInfo?.alive ? "Si" : "No"}</li>
          </ul>
        </div>
        <div className="size-12">
          {lawyerInfo?.active ? (
            <ThumbsUpIcon strokeWidth={2} className="size-12 text-green-600" />
          ) : (
            <ThumbsDownIcon strokeWidth={2} className="size-12 text-red-600" />
          )}
        </div>
      </div>
      <p className="text-xs text-gray-500 text-center mt-4">
        {`(Datos actualizados al ${format(new Date(), "dd/MM/yyyy - HH:mm:ss", {
          locale: es,
        })})`}
      </p>
      <p className="text-xs text-gray-500 text-center mt-2">
        Nota: Después del pago se actualizará de 24 a 48 horas como máximo.
      </p>
    </div>
  ): null;
}
