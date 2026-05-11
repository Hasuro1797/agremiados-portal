"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  GETAMOUNTFORQUOTE,
  GETLAWYERLASTQUOTE,
} from "@/graphql/query/order.query";
import { AmountForQuote, Discount } from "@/types/orders.type";
import { useLazyQuery, useQuery } from "@apollo/client";
import { addMonths, format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { get } from "lodash";
import { BadgePercent, CheckCircle2, CircleX, Loader } from "lucide-react";
import React, { Dispatch, Fragment, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface StepPaymentConfigProps {
  setPaymentData: Dispatch<React.SetStateAction<AmountForQuote>>;
  handleNext: () => void;
}

export default function StepPaymentConfig({
  setPaymentData,
  handleNext,
}: StepPaymentConfigProps) {
  const [selectedQuotes, setSelectedQuotes] = useState(0);

  const [
    getAmountForQuote,
    {
      data: amountForQuoteData,
      loading: amountForQuoteLoading,
      error: amountForQuoteError,
    },
  ] = useLazyQuery(GETAMOUNTFORQUOTE, {
    fetchPolicy: "no-cache",
    onError: (error) => {
      console.error("Error fetching amount for quote:", error);
      toast.error(error.cause?.name || "Ocurrió un error", {
        description:
          error.message ||
          "No se pudo obtener el monto para la cuota seleccionada.",
        classNames: {
          toast: "bg-background",
          icon: "text-red-500",
          title: "text-foreground",
          description: "text-foreground",
        },
      });
    },
  });

  const {
    loading: lawyerLastQuoteLoading,
    data: lawyerLastQuoteData,
    error: lawyerLastQuoteError,
  } = useQuery(GETLAWYERLASTQUOTE, {
    fetchPolicy: "network-only",
  });

  // Ref stores the latest render values so the sync effect can read them
  // without being listed as reactive deps (which would fire it prematurely
  // after a select change but before the new fetch completes).
  const latestRef = useRef<{
    selectedQuotes: number;
    lawyerLastQuoteData: typeof lawyerLastQuoteData;
  }>({ selectedQuotes: 0, lawyerLastQuoteData: undefined });
  latestRef.current.selectedQuotes = selectedQuotes;
  latestRef.current.lawyerLastQuoteData = lawyerLastQuoteData;

  // null while loading, number once data arrives
  const totalQuotes = get(
    lawyerLastQuoteData,
    "getLawyerLastQuote.totalQuotes",
    null,
  ) as number | null;

  const getDiscountForQuotes = (quotes: number): Discount | undefined => {
    const available = get(
      lawyerLastQuoteData,
      "getLawyerLastQuote.discounts.available",
      false,
    );
    if (!available) return undefined;
    const data = get(
      lawyerLastQuoteData,
      "getLawyerLastQuote.discounts.data",
      [],
    ) as Discount[];
    return data.find((d) => d.quotesNumber === quotes);
  };

  const formatDateRange = (dateString: string) => {
    const date = parse(dateString, "yyyyMM", new Date());
    return format(date, "MMMM yyyy", { locale: es });
  };

  const getRangeUntil = () => {
    const periodFrom = get(
      lawyerLastQuoteData,
      "getLawyerLastQuote.periodFrom",
      "",
    );
    if (!periodFrom || !selectedQuotes) return "";
    const startDate = parse(periodFrom, "yyyyMM", new Date());
    const endDate = addMonths(startDate, selectedQuotes);
    return format(endDate, "MMMM yyyy", { locale: es });
  };

  const getQuotesOptions = () => {
    const maxQuotes =
      totalQuotes !== null && totalQuotes > 0 ? totalQuotes : 12;
    const options = [];
    for (let i = 1; i <= maxQuotes; i++) {
      const discount = getDiscountForQuotes(i);
      options.push({
        value: i.toString(),
        label: `${i} ${i === 1 ? "cuota" : "cuotas"}`,
        discount,
      });
    }
    return options;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getActiveSocialAmount = () => {
    if (getDiscountForQuotes(selectedQuotes)) {
      return get(
        amountForQuoteData,
        "getAmountForQuotes.socialAmount.totalWithDiscount",
        0,
      );
    }
    return get(amountForQuoteData, "getAmountForQuotes.socialAmount.total", 0);
  };

  const getTotal = () =>
    getActiveSocialAmount() +
    get(amountForQuoteData, "getAmountForQuotes.mutualAmount.total", 0);

  const handleQuoteChange = async (value: string) => {
    const newQuote = parseInt(value, 10);
    setSelectedQuotes(newQuote);
    const discount = getDiscountForQuotes(newQuote);
    await getAmountForQuote({
      variables: {
        amountForQuotesDto: {
          numberQuotes: newQuote,
          ...(discount ? { discountId: discount.id } : {}),
        },
      },
    });
  };

  // Initial load: pre-select totalQuotes only when the lawyer has pending quotes (> 0)
  useEffect(() => {
    if (
      !lawyerLastQuoteLoading &&
      !lawyerLastQuoteError &&
      lawyerLastQuoteData
    ) {
      const quotes = get(
        lawyerLastQuoteData,
        "getLawyerLastQuote.totalQuotes",
        0,
      );
      if (quotes > 0) {
        setSelectedQuotes(quotes);
        const available = get(
          lawyerLastQuoteData,
          "getLawyerLastQuote.discounts.available",
          false,
        );
        const discountsData = available
          ? (get(
              lawyerLastQuoteData,
              "getLawyerLastQuote.discounts.data",
              [],
            ) as Discount[])
          : [];
        const discount = discountsData.find((d) => d.quotesNumber === quotes);
        getAmountForQuote({
          variables: {
            amountForQuotesDto: {
              numberQuotes: quotes,
              ...(discount ? { discountId: discount.id } : {}),
            },
          },
        });
      }
    }
  }, [
    lawyerLastQuoteLoading,
    lawyerLastQuoteError,
    lawyerLastQuoteData,
    getAmountForQuote,
  ]);

  // Sync payment data to parent when the API responds.
  // Reads selectedQuotes / lawyerLastQuoteData from latestRef so they don't
  // need to be reactive deps (adding them would fire this with stale API data
  // on every select change before the new fetch completes).
  useEffect(() => {
    if (!amountForQuoteLoading && !amountForQuoteError && amountForQuoteData) {
      const {
        selectedQuotes: currentQuotes,
        lawyerLastQuoteData: currentLLQD,
      } = latestRef.current;
      const periodFrom = get(currentLLQD, "getLawyerLastQuote.periodFrom", "");
      const available = get(
        currentLLQD,
        "getLawyerLastQuote.discounts.available",
        false,
      );
      const discountsData = available
        ? (get(
            currentLLQD,
            "getLawyerLastQuote.discounts.data",
            [],
          ) as Discount[])
        : [];
      const discount = discountsData.find(
        (d) => d.quotesNumber === currentQuotes,
      );
      setPaymentData({
        socialAmount: get(
          amountForQuoteData,
          "getAmountForQuotes.socialAmount",
          {
            total: 0,
            percentageDiscount: discount ? discount.percentage : 0,
            totalWithDiscount: 0,
          },
        ),
        mutualAmount: get(
          amountForQuoteData,
          "getAmountForQuotes.mutualAmount",
          {
            total: 0,
            percentageDiscount: discount ? discount.percentage : 0,
            totalWithDiscount: 0,
          },
        ),
        periodFrom,
        quantityInstallments: currentQuotes,
        ...(discount ? { discountId: discount.id } : {}),
      });
    }
  }, [
    amountForQuoteData,
    amountForQuoteLoading,
    amountForQuoteError,
    setPaymentData,
  ]);

  const activeDiscount = getDiscountForQuotes(selectedQuotes);
  const currentOption = getQuotesOptions().find(
    (o) => o.value === selectedQuotes.toString(),
  );
  const savings =
    activeDiscount && amountForQuoteData
      ? get(amountForQuoteData, "getAmountForQuotes.socialAmount.total", 0) -
        get(
          amountForQuoteData,
          "getAmountForQuotes.socialAmount.totalWithDiscount",
          0,
        )
      : 0;

  return (
    <div className="space-y-6">
      {lawyerLastQuoteLoading ? (
        <div className="flex justify-center items-center w-full h-[calc(90vh_-_88px)]">
          <Loader
            strokeWidth={2}
            className="text-primary size-10 animate-spin repeat-infinite"
          />
        </div>
      ) : lawyerLastQuoteError ? (
        <div className="flex justify-center flex-col items-center px-4 md:px-6 h-[calc(90vh_-_88px)]">
          <CircleX className="h-10 w-10 text-red-500" />
          <p className="text-primary text-center max-w-sm text-sm md:max-w-md lg:max-w-lg">
            Ocurrió un error al cargar la información de la cuota. Por favor,
            inténtalo de nuevo más tarde o comunícate con soporte.
          </p>
        </div>
      ) : (
        <Fragment>
          {/* Banner informativo cuando el abogado está al día o pagó por adelantado */}
          {totalQuotes !== null && totalQuotes <= 0 && (
            <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <div className="space-y-1">
                {totalQuotes === 0 ? (
                  <p className="text-sm font-semibold text-green-800">
                    Estás al día con tus cuotas sociales
                  </p>
                ) : (
                  <p className="text-sm font-semibold text-green-800">
                    Llevas {Math.abs(totalQuotes)}{" "}
                    {Math.abs(totalQuotes) === 1
                      ? "mes pagado"
                      : "meses pagados"}{" "}
                    por adelantado
                  </p>
                )}
                <p className="text-xs text-green-700">
                  Si deseas pagar cuotas adicionales por adelantado, selecciona
                  la cantidad a continuación.
                </p>
              </div>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-primary">
                Configuración de Pago
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Rango desde
                  </Label>
                  <p className="mt-1 text-primary font-medium">
                    {formatDateRange(
                      get(
                        lawyerLastQuoteData,
                        "getLawyerLastQuote.periodFrom",
                        "",
                      ),
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Rango Hasta
                  </Label>
                  <div className="mt-1">
                    {amountForQuoteLoading ? (
                      <div className="h-5 w-32 bg-gray-200 animate-pulse rounded" />
                    ) : (
                      <p className="text-primary font-medium">
                        {selectedQuotes > 0 && getRangeUntil()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Cuotas a pagar
                </Label>
                <div className="mt-2">
                  {amountForQuoteLoading ? (
                    <div className="h-10 w-full bg-gray-200 animate-pulse rounded" />
                  ) : (
                    <Select
                      value={
                        selectedQuotes > 0 ? selectedQuotes.toString() : ""
                      }
                      onValueChange={handleQuoteChange}
                      disabled={lawyerLastQuoteLoading || amountForQuoteLoading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue>
                          <span className="flex items-center gap-2">
                            {currentOption?.label ?? "Selecciona cuotas"}
                            {activeDiscount && (
                              <Badge className="bg-green-600 hover:bg-green-600 text-white text-xs px-1.5 py-0 h-5">
                                {activeDiscount.percentage}% OFF
                              </Badge>
                            )}
                          </span>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {getQuotesOptions().map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <span className="flex items-center gap-2">
                              {option.label}
                              {option.discount && (
                                <Badge className="bg-green-600 hover:bg-green-600 text-white text-xs px-1.5 py-0 h-5">
                                  {option.discount.percentage}% OFF
                                </Badge>
                              )}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {totalQuotes !== null && totalQuotes > 0 ? (
                    <p>
                      Cuotas pendientes según nuestra información: máximo{" "}
                      {totalQuotes} cuotas
                    </p>
                  ) : (
                    <p>Puede seleccionar de 1 a 12 cuotas adicionales</p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Cuotas Sociales</span>
                  {amountForQuoteLoading ? (
                    <div className="h-5 w-20 bg-gray-200 animate-pulse rounded" />
                  ) : (
                    <div className="text-right">
                      {activeDiscount ? (
                        <>
                          <p className="text-xs line-through text-gray-400">
                            {formatCurrency(
                              get(
                                amountForQuoteData,
                                "getAmountForQuotes.socialAmount.total",
                                0,
                              ),
                            )}
                          </p>
                          <span className="font-semibold text-green-700 flex items-center gap-1">
                            {formatCurrency(
                              get(
                                amountForQuoteData,
                                "getAmountForQuotes.socialAmount.totalWithDiscount",
                                0,
                              ),
                            )}
                            <BadgePercent className="h-4 w-4" />
                          </span>
                        </>
                      ) : (
                        <span className="font-semibold text-blue-900">
                          {formatCurrency(
                            get(
                              amountForQuoteData,
                              "getAmountForQuotes.socialAmount.total",
                              0,
                            ),
                          )}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Fila de ahorro — solo visible cuando hay descuento activo */}
                {activeDiscount && savings > 0 && !amountForQuoteLoading && (
                  <div className="flex justify-between items-center rounded-md bg-green-50 border border-green-200 px-3 py-2">
                    <span className="text-sm text-green-700 font-medium flex items-center gap-1.5">
                      <BadgePercent className="h-4 w-4" />
                      {activeDiscount.name} - {activeDiscount.percentage}%
                    </span>
                    <span className="text-sm font-semibold text-green-700">
                      -{formatCurrency(savings)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span>Fondo Mutual</span>
                  {amountForQuoteLoading ? (
                    <div className="h-5 w-20 bg-gray-200 animate-pulse rounded" />
                  ) : (
                    <span className="font-semibold text-blue-900">
                      {formatCurrency(
                        get(
                          amountForQuoteData,
                          "getAmountForQuotes.mutualAmount.total",
                          0,
                        ),
                      )}
                    </span>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between items-center text-lg">
                  <span className="font-bold">Total a Pagar</span>
                  {amountForQuoteLoading ? (
                    <div className="h-5 w-20 bg-gray-200 animate-pulse rounded" />
                  ) : (
                    <span className="font-semibold text-blue-900">
                      {formatCurrency(getTotal())}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              disabled={
                Boolean(amountForQuoteError) ||
                selectedQuotes === 0 ||
                !amountForQuoteData
              }
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Continuar
            </Button>
          </div>
        </Fragment>
      )}
    </div>
  );
}
