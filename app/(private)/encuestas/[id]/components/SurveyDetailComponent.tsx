"use client";
import Footer from "@/components/Footer";
import HomeNavbar from "@/components/home/HomeNavbar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SUBMIT_SURVEY_RESPONSE } from "@/graphql/mutation/survey.mutation";
import { FIND_ONE_PUBLIC_SURVEY } from "@/graphql/query/survey.query";
import {
  ISubmitSurveyAnswerInput,
  ISurveyDetail,
  ISurveyQuestion,
} from "@/types/survey.type";
import { QuestionType } from "@/utils/enum";
import { useMutation, useQuery } from "@apollo/client";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  ClipboardList,
  LoaderCircle,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { toast } from "sonner";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type QuestionAnswerState = {
  optionId?: number;
  optionIds?: number[];
  textValue?: string;
  scaleValue?: number;
};

const formatDate = (date: string | null) =>
  date ? format(parseISO(date), "dd 'de' MMMM yyyy", { locale: es }) : null;

function ScaleQuestion({
  question,
  value,
  onChange,
}: {
  question: ISurveyQuestion;
  value: number | undefined;
  onChange: (v: number) => void;
}) {
  const min = question.scaleMin ?? 1;
  const max = question.scaleMax ?? 5;
  const steps = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div className="flex flex-col gap-2">
      {(question.scaleMinLabel || question.scaleMaxLabel) && (
        <div className="flex justify-between text-xs text-gray-400">
          <span>{question.scaleMinLabel ?? min}</span>
          <span>{question.scaleMaxLabel ?? max}</span>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {steps.map((step) => (
          <button
            key={step}
            type="button"
            onClick={() => onChange(step)}
            className={cn(
              "size-10 rounded-xl border-2 text-sm font-semibold transition-all",
              value === step
                ? "bg-primary text-white border-primary shadow-sm"
                : "border-gray-200 text-gray-600 hover:border-primary hover:text-primary",
            )}
          >
            {step}
          </button>
        ))}
      </div>
    </div>
  );
}

function SurveyQuestion({
  question,
  answer,
  onChange,
}: {
  question: ISurveyQuestion;
  answer: QuestionAnswerState;
  onChange: (a: QuestionAnswerState) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <span className="text-xs bg-primary/10 text-primary rounded-full px-2.5 py-1 font-bold shrink-0 mt-0.5">
          {question.order}
        </span>
        <p className="text-sm font-semibold text-gray-900 leading-snug">
          {question.text}
          {question.isRequired && <span className="text-red-500 ml-1">*</span>}
        </p>
      </div>

      {question.type === QuestionType.SINGLE_CHOICE && (
        <div className="flex flex-col gap-2 pl-8">
          {[...question.options]
            .sort((a, b) => a.order - b.order)
            .map((opt) => (
              <label
                key={opt.id}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div
                  className={cn(
                    "size-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0",
                    answer.optionId === opt.id
                      ? "border-primary"
                      : "border-gray-300 group-hover:border-primary",
                  )}
                  onClick={() => onChange({ optionId: opt.id })}
                >
                  {answer.optionId === opt.id && (
                    <div className="size-2.5 rounded-full bg-primary" />
                  )}
                </div>
                <span
                  className="text-sm text-gray-700 cursor-pointer"
                  onClick={() => onChange({ optionId: opt.id })}
                >
                  {opt.text}
                </span>
              </label>
            ))}
        </div>
      )}

      {question.type === QuestionType.MULTIPLE_CHOICE && (
        <div className="flex flex-col gap-2.5 pl-8">
          {[...question.options]
            .sort((a, b) => a.order - b.order)
            .map((opt) => {
              const selected = answer.optionIds?.includes(opt.id) ?? false;
              return (
                <div key={opt.id} className="flex items-center gap-3">
                  <Checkbox
                    id={`opt-${opt.id}`}
                    checked={selected}
                    onCheckedChange={(checked) => {
                      const current = answer.optionIds ?? [];
                      onChange({
                        optionIds: checked
                          ? [...current, opt.id]
                          : current.filter((id) => id !== opt.id),
                      });
                    }}
                  />
                  <Label
                    htmlFor={`opt-${opt.id}`}
                    className="text-sm font-normal cursor-pointer text-gray-700"
                  >
                    {opt.text}
                  </Label>
                </div>
              );
            })}
        </div>
      )}

      {question.type === QuestionType.TEXT && (
        <div className="pl-8">
          <Textarea
            placeholder="Escribe tu respuesta aquí..."
            value={answer.textValue ?? ""}
            onChange={(e) => onChange({ textValue: e.target.value })}
            rows={3}
            className="resize-none border-gray-200 rounded-xl text-sm"
          />
        </div>
      )}

      {question.type === QuestionType.SCALE && (
        <div className="pl-8">
          <ScaleQuestion
            question={question}
            value={answer.scaleValue}
            onChange={(v) => onChange({ scaleValue: v })}
          />
        </div>
      )}
    </div>
  );
}

function SkeletonDetail() {
  return (
    <div className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-4 animate-pulse">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
        <div className="h-6 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-4 bg-gray-100 rounded w-1/2" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3"
        >
          <div className="flex gap-3">
            <div className="h-6 w-8 bg-gray-200 rounded-full" />
            <div className="h-5 bg-gray-200 rounded flex-1" />
          </div>
          <div className="pl-11 space-y-2">
            <div className="h-4 bg-gray-100 rounded w-1/3" />
            <div className="h-4 bg-gray-100 rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SurveyDetailComponent({
  surveyId,
}: {
  surveyId: string;
}) {
  const [answers, setAnswers] = useState<Record<number, QuestionAnswerState>>(
    {},
  );
  const [submitted, setSubmitted] = useState(false);
  const [completedAt, setCompletedAt] = useState<string | null>(null);

  const { data, loading, error } = useQuery(FIND_ONE_PUBLIC_SURVEY, {
    variables: { id: +surveyId },
  });

  const [submitResponse, { loading: submitting }] = useMutation(
    SUBMIT_SURVEY_RESPONSE,
    {
      onCompleted: (d) => {
        setCompletedAt(d?.submitSurveyResponse?.completedAt ?? null);
        setSubmitted(true);
        toast.success("¡Respuesta enviada correctamente!", {
          position: "top-center",
        });
      },
      onError: (err) => {
        toast.error(err.message ?? "Error al enviar la encuesta", {
          position: "top-center",
        });
      },
    },
  );

  const survey: ISurveyDetail | undefined = data?.findOnePublicSurvey;

  const handleAnswerChange = (questionId: number, a: QuestionAnswerState) => {
    setAnswers((prev) => ({ ...prev, [questionId]: a }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!survey) return;

    const unanswered = survey.questions
      .filter((q) => q.isRequired)
      .filter((q) => {
        const a = answers[q.id];
        if (!a) return true;
        if (q.type === QuestionType.SINGLE_CHOICE)
          return a.optionId === undefined;
        if (q.type === QuestionType.MULTIPLE_CHOICE)
          return !a.optionIds || a.optionIds.length === 0;
        if (q.type === QuestionType.TEXT) return !a.textValue?.trim();
        if (q.type === QuestionType.SCALE) return a.scaleValue === undefined;
        return true;
      });

    if (unanswered.length > 0) {
      toast.error("Por favor responde todas las preguntas obligatorias.", {
        position: "top-center",
      });
      return;
    }

    const answersInput: ISubmitSurveyAnswerInput[] = [];
    for (const question of survey.questions) {
      const a = answers[question.id];
      if (!a) continue;
      if (
        question.type === QuestionType.SINGLE_CHOICE &&
        a.optionId !== undefined
      )
        answersInput.push({ questionId: question.id, optionId: a.optionId });
      else if (question.type === QuestionType.MULTIPLE_CHOICE && a.optionIds)
        for (const optId of a.optionIds)
          answersInput.push({ questionId: question.id, optionId: optId });
      else if (question.type === QuestionType.TEXT && a.textValue)
        answersInput.push({ questionId: question.id, textValue: a.textValue });
      else if (
        question.type === QuestionType.SCALE &&
        a.scaleValue !== undefined
      )
        answersInput.push({
          questionId: question.id,
          scaleValue: a.scaleValue,
        });
    }

    submitResponse({
      variables: { input: { surveyId: +surveyId, answers: answersInput } },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HomeNavbar />

      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
            <Link
              href={routes.home}
              className="hover:text-gray-600 transition-colors"
            >
              Inicio
            </Link>
            <span>/</span>
            <Link
              href={routes.surveys.home}
              className="hover:text-gray-600 transition-colors"
            >
              Encuestas
            </Link>
            {survey && (
              <>
                <span>/</span>
                <span className="text-gray-700 font-medium line-clamp-1 max-w-[200px]">
                  {survey.title}
                </span>
              </>
            )}
          </nav>
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <ClipboardList className="size-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              {survey ? (
                <>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                      {survey.title}
                    </h1>
                    {survey.isAnonymous && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-gray-100 text-gray-600">
                        Anónima
                      </span>
                    )}
                  </div>
                  {survey.description && (
                    <p className="text-gray-500 text-sm mt-1">
                      {survey.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 mt-2">
                    {(survey.startDate || survey.endDate) && (
                      <p className="text-xs text-gray-400 flex items-center gap-1.5">
                        <CalendarClock className="size-3.5 text-primary shrink-0" />
                        {survey.endDate
                          ? `Disponible hasta el ${formatDate(survey.endDate)}`
                          : `Disponible desde el ${formatDate(survey.startDate)}`}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      Los campos con{" "}
                      <span className="text-red-500 font-bold">*</span> son
                      obligatorios
                    </p>
                  </div>
                </>
              ) : loading ? (
                <div className="h-7 bg-gray-200 rounded animate-pulse w-64" />
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading && <SkeletonDetail />}

      {!loading && error && (
        <div className="flex-1 flex items-center justify-center py-24">
          <div className="text-center">
            <CircleAlert className="size-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              No se pudo cargar la encuesta.
            </p>
            <Link
              href={routes.surveys.home}
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <ArrowLeft className="size-4" /> Volver a Encuestas
            </Link>
          </div>
        </div>
      )}

      {!loading && !error && submitted && (
        <div className="flex-1 flex items-center justify-center py-24 px-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 max-w-md w-full flex flex-col items-center gap-4 text-center animate-in fade-in-0 zoom-in-95 duration-500">
            <div className="size-16 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="size-9 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                ¡Gracias por participar!
              </h2>
              <p className="text-gray-500 text-sm mt-1.5">
                Tu respuesta fue registrada el{" "}
                {completedAt
                  ? format(parseISO(completedAt), "dd 'de' MMMM yyyy, HH:mm", {
                      locale: es,
                    })
                  : format(new Date(), "dd 'de' MMMM yyyy", { locale: es })}
                .
              </p>
            </div>
            <Link
              href={routes.surveys.home}
              className="mt-2 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <ArrowLeft className="size-4" /> Volver a Encuestas
            </Link>
          </div>
        </div>
      )}

      {!loading && !error && survey && !submitted && (
        <div className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-500"
          >
            {[...survey.questions]
              .sort((a, b) => a.order - b.order)
              .map((q) => (
                <SurveyQuestion
                  key={q.id}
                  question={q}
                  answer={answers[q.id] ?? {}}
                  onChange={(a) => handleAnswerChange(q.id, a)}
                />
              ))}

            <div className="flex items-center gap-4 pt-2">
              <Button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl"
              >
                {submitting ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin mr-2" />{" "}
                    Enviando...
                  </>
                ) : (
                  "Enviar respuesta"
                )}
              </Button>
              <Link
                href={routes.surveys.home}
                className="text-sm text-gray-400 hover:text-primary transition-colors"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      )}

      <Footer />
    </div>
  );
}
