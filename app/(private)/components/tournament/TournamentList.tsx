/* eslint-disable @next/next/no-img-element */
"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { GET_ALL_TOURNAMENTS } from "@/graphql/query/sport.query";
import { routes } from "@/lib/routes";
import { ITournament } from "@/types/activities";
import { useQuery } from "@apollo/client";
import { get } from "lodash";
import { CircleAlert } from "lucide-react";
import Link from "next/link";
import React, { Fragment } from "react";

export default function TournamentList({
  tournamentId,
  title,
}: {
  tournamentId: number;
  title: string;
}) {
  const {
    data: tournamentData,
    loading: tournamentLoading,
    error: tournamentError,
  } = useQuery(GET_ALL_TOURNAMENTS, {
    variables: {
      sportActivityId: tournamentId,
    },
  });
  return (
    <Fragment>
      <div className="size-full">
        <div className="w-full text-[#D9D9D9] px-4 pt-5 flex gap-4 justify-between items-center">
          <div className="h-[2px] flex-1 bg-[#D9D9D9]"></div>
          <div>
            <h3 className="text-xl uppercase text-balance font-bold">
              {title}
            </h3>
          </div>
          <div className="h-[2px] flex-1 bg-[#D9D9D9]"></div>
        </div>
        {tournamentLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="aspect-square" />
            ))}
          </div>
        ) : tournamentError ? (
          <div className="flex py-3 flex-col gap-2 justify-center text-red-600 items-center size-full">
            <CircleAlert strokeWidth={2} className="size-10" />
            <p className="max-w-[320px] text-center text-lg 2xl:text-xl">
              Error al cargar los torneos. Intente más tarde
            </p>
          </div>
        ) : get(tournamentData, "findAllTournaments", []).length === 0 ? (
          <div className="flex py-3 justify-center items-center size-full">
            <p className="max-w-[320px] text-lg text-center 2xl:text-xl text-blue-100">
              No se encontraron torneos para este campeonato
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-5 max-h-[calc(90vh_-_90px)] 2xl:max-w-screen-2xl 2xl:h-[calc(70vh_-_90px)] my-5 mx-5 overflow-auto">
            {get(tournamentData, "findAllTournaments", []).map(
              (tournament: ITournament) => (
                <li
                  key={tournament.id}
                  className="aspect-square size-full flex gap-2 flex-col items-center justify-center"
                >
                  <img
                    src={get(tournament, "discipline.mainImage.url", "")}
                    alt={get(tournament, "discipline.name", "")}
                    className="w-[65%] aspect-square object-contain rounded-full inline-block ring-1"
                  />
                  <p className="text-center text-lg font-semibold text-blue-100">
                    {get(tournament, "discipline.name", "")}
                  </p>
                  <div className="flex gap-2 justify-center items-center">
                    <Link
                      href={`${routes.championships.fixture}/${tournament.id}`}
                      className="bg-[#006FFD] text-sm text-blue-100 text-bold px-4 py-2 rounded-lg"
                    >
                      Ver Fixture
                    </Link>
                  </div>
                </li>
              )
            )}
          </ul>
        )}
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"></ul>
      </div>
    </Fragment>
  );
}
