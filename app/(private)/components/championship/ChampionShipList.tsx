/* eslint-disable @next/next/no-img-element */
"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { GET_ALL_SPORTS } from "@/graphql/query/sport.query";
import { ISportActivity } from "@/types/activities";
import { useQuery } from "@apollo/client";
import { get } from "lodash";
import { CircleAlert } from "lucide-react";
import { Fragment } from "react";
import TournamentList from "../tournament/TournamentList";

export default function ChampionShipList() {
  const {
    data: sportActivity,
    loading: sportLoading,
    error: sportError,
  } = useQuery(GET_ALL_SPORTS, {
    variables: {
      page: 1,
      pageSize: 100,
      orderBy: "date-desc",
      search: "",
    },
  });
  const getGridClass = (total: number) => {
    if (total === 1) return "grid-cols-1 md:w-1/3 mx-auto";
    if (total === 2) return "grid-cols-2 gap-6";
    return "grid-cols-1 md:grid-cols-3 gap-6";
  };
  const getCardClass = (
    index: number,
    total: number,
    mode: "skeleton" | "item"
  ) => {
    const isCenter =
      index % 3 === 1 || (total === 2 && index === 1) || total === 1;
    const baseClass = isCenter
      ? "bg-[#232C57] text-blue-100"
      : "bg-white text-[#1D308F] border-[4px] border-[#5874FF]";
    const scaleClass =
      isCenter && total >= 3
        ? "md:scale-110 transition-transform relative z-10"
        : "self-end";
    return `${
      mode === "item" ? baseClass : "text-bold aspect-square size-full"
    } ${scaleClass}`;
  };

  if (sportError) {
    <div className="container mx-auto px-6">
      <div className="flex flex-col gap-2 justify-center text-red-600 items-center w-full h-[calc(100vh_-_340px)]">
        <CircleAlert strokeWidth={2} className="!size-10" />
        <p className="text-lg">Error al cargar las actividades</p>
      </div>
    </div>;
  }
  return (
    <div className="container mx-auto px-6">
      <ul className={`grid ${getGridClass(3)} gap-x-12 relative items-end`}>
        {sportLoading ? (
          <Fragment>
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton
                key={index}
                className={getCardClass(index, 3, "skeleton")}
              />
            ))}
          </Fragment>
        ) : sportError ? (
          <div className="flex col-span-3 flex-col gap-2 justify-center text-red-600 items-center w-full h-[calc(100vh_-_340px)]">
            <CircleAlert strokeWidth={2} className="!size-10" />
            <p className="text-lg">Error al cargar las actividades</p>
          </div>
        ) : (
          <Fragment>
            {get(sportActivity, "findAllSportActivities.activities", []).map(
              (championship: ISportActivity, index: number) => (
                <Dialog key={championship.id}>
                  <DialogTrigger asChild>
                    <button type="button">
                      <Card
                        className={getCardClass(
                          index,
                          get(
                            sportActivity,
                            "findAllSportActivities.meta.total",
                            0
                          ),
                          "item"
                        )}
                      >
                        <CardContent
                          className={`flex flex-col items-center justify-center p-6 space-y-4 ${
                            index % 3 === 1 ||
                            get(
                              sportActivity,
                              "findAllSportActivities.meta.total",
                              0
                            ) <= 2
                              ? "py-8"
                              : ""
                          }`}
                        >
                          <img
                            src={get(championship, "media.url", "")}
                            alt={championship.title}
                            className="w-[70%] object-cover rounded-lg inline-block aspect-square"
                          />
                          <h3
                            className={`text-xl text-balance max-w-[85%] uppercase font-bold text-center`}
                          >
                            {championship.title}
                          </h3>
                        </CardContent>
                      </Card>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="gap-0 max-w-[95vw] h-[90vh] 2xl:max-w-screen-2xl 2xl:h-[70vh] bg-[#232C57] p-0 border-primary">
                    <TournamentList tournamentId={championship.id} title={championship.title}/>
                  </DialogContent>
                </Dialog>
              )
            )}
          </Fragment>
        )}
      </ul>
    </div>
  );
}
