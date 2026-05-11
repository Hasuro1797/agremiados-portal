/* eslint-disable @next/next/no-img-element */
"use client";
import { GET_TOURNAMENT_BY_ID } from "@/graphql/query/sport.query";
import { IMedia } from "@/types/activities";
import { useQuery } from "@apollo/client";
import { get } from "lodash";
import { CircleAlert, LoaderCircle } from "lucide-react";
import React from "react";

export default function TournamentFixture({
  sportActivityId,
}: {
  sportActivityId: string;
}) {
  const { data, loading, error } = useQuery(GET_TOURNAMENT_BY_ID, {
    variables: {
      findOneTournamentId: +sportActivityId,
    },
  });
  return (
    <div className="container py-14 w-full flex flex-col items-center">
      {loading ? (
        <div className="w-full flex justify-center items-center h-[calc(100vh_-_90px)]">
          <LoaderCircle
            className="!size-10 text-blue-500 animate-spin repeat-infinite"
            strokeWidth={2}
          />
        </div>
      ) : error ? (
        <div className="w-full flex flex-col gap-2 justify-center items-center h-[calc(100vh_-_90px)]">
          <CircleAlert strokeWidth={2} className="!size-10" />
          <p className="text-red-600 text-md">Error al cargar el torneo</p>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center">
          <div className="w-full flex flex-col gap-24 items-center">
            <div className="w-full px-6 space-y-10 flex flex-col items-center">
              <div className="w-full max-w-[600px]  flex gap-6 justify-between items-center">
                <span className="h-[2px] inline-block flex-1 bg-[#D9D9D9]" />
                <div className="bg-[#1D308F] rounded-lg py-2 px-4">
                  <h1 className="text-lg sm:text-2xl text-blue-100 text-center text-[24px] font-semibold">
                    Tabla de posiciones
                  </h1>
                </div>
                <span className="inline-block w-full h-[2px] flex-1 bg-[#D9D9D9]" />
              </div>
              <div className="w-full flex flex-col gap-5">
                {get(data, "findOneTournament.media", [])
                  .slice(1)
                  .map((media: IMedia, index: number) => (
                    <img
                      key={index}
                      src={media.url}
                      alt={media.title}
                      className="inline-block mx-auto max-w-[730px] w-full"
                    />
                  ))}
                {/* <img
                  src={get(data, "findOneTournament.media.[0].url", "")}
                  alt={get(data, "findOneTournament.media.[0].title", "")}
                  className="inline-block max-w-[730px] w-full"
                /> */}
              </div>
            </div>
            <div className="px-6 space-y-10 flex flex-col items-center">
              <div className="w-full max-w-[600px]  flex gap-6 justify-between items-center">
                <span className="h-[2px] inline-block flex-1 bg-[#D9D9D9]" />
                <div className="bg-[#1D308F] rounded-lg py-2 px-4">
                  <h1 className="text-lg sm:text-2xl text-blue-100 text-center text-[24px] font-semibold">
                    Fecha y hora de partidos
                  </h1>
                </div>
                <span className="inline-block w-full h-[2px] flex-1 bg-[#D9D9D9]" />
              </div>
              <img
                src={get(data, "findOneTournament.media.[0].url", "")}
                alt={get(data, "findOneTournament.media.[0].title", "")}
                className="inline-block max-w-[1200px] w-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
