"use client";

import Footer from "@/components/Footer";
import HomeNavbar from "@/components/home/HomeNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  ADD_SUPPORT_MESSAGE,
  RATE_SUPPORT_RESOLUTION,
  REOPEN_SUPPORT,
} from "@/graphql/mutation/support.mutation";
import { SUPPORT_BY_ID } from "@/graphql/query/support.query";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import {
  SupportAttachment,
  SupportDetail,
  SupportMessage,
} from "@/types/support.type";
import { useMutation, useQuery } from "@apollo/client";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { get } from "lodash";
import {
  ArrowLeft,
  CheckCircle2,
  CircleX,
  FileText,
  Loader2,
  RefreshCw,
  Send,
  Star,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import AttachmentsPicker from "./AttachmentsPicker";
import {
  PRIORITY_CLASSES,
  PRIORITY_LABELS,
  STATUS_CLASSES,
  STATUS_LABELS,
} from "./support-utils";

const MAX_ATTACHMENTS = 10;

const formatDateTime = (iso?: string | null) => {
  if (!iso) return "";
  try {
    return format(parseISO(iso), "dd MMM yyyy, h:mm a", { locale: es });
  } catch {
    return iso;
  }
};

const isImage = (format?: string | null) =>
  !!format && format.toLowerCase().startsWith("image");

interface SupportDetailPageComponentProps {
  id: number;
}

export default function SupportDetailPageComponent({
  id,
}: SupportDetailPageComponentProps) {
  const [reply, setReply] = useState("");
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [openRate, setOpenRate] = useState(false);
  const [openReopen, setOpenReopen] = useState(false);
  const threadEndRef = useRef<HTMLDivElement | null>(null);

  const { data, loading, error, refetch } = useQuery(SUPPORT_BY_ID, {
    variables: { id },
    fetchPolicy: "cache-and-network",
  });

  const support = get(data, "support", null) as SupportDetail | null;

  const visibleMessages: SupportMessage[] = useMemo(() => {
    const msgs = support?.messages ?? [];
    return [...msgs]
      .filter((m) => !m.isInternal)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
  }, [support?.messages]);

  // Latest non-internal message authored by staff (non-MEMBER) — used as the
  // "resolution" snippet in the green banner when the ticket is RESOLVED.
  const resolutionMessage = useMemo(() => {
    if (support?.status !== "RESOLVED") return null;
    const staff = visibleMessages.filter((m) => m.author?.role !== "MEMBER");
    return staff[staff.length - 1] ?? null;
  }, [support?.status, visibleMessages]);

  const [addMessage] = useMutation(ADD_SUPPORT_MESSAGE);

  const status = support?.status;
  const canReply = !!status && status !== "CLOSED" && status !== "REJECTED";
  const canRate = status === "RESOLVED" && !support?.satisfactionRating;
  const canReopen = status === "RESOLVED" || status === "REJECTED";
  const isClosed = status === "CLOSED";

  const canSendReply =
    (reply.trim().length > 0 || replyFiles.length > 0) &&
    replyFiles.length <= MAX_ATTACHMENTS &&
    canReply &&
    !sending;

  const handleSend = async () => {
    if (!support || !canSendReply) return;
    setSending(true);
    try {
      await addMessage({
        variables: {
          input: {
            supportId: support.id,
            body: reply.trim() || "(adjuntos)",
          },
          // Files travel as multipart/form-data via apollo-upload-client.
          ...(replyFiles.length > 0 ? { files: replyFiles } : {}),
        },
      });
      setReply("");
      setReplyFiles([]);
      await refetch();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "No se pudo enviar el mensaje.",
      );
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (threadEndRef.current) {
      threadEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [visibleMessages.length]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HomeNavbar />

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-primary"
          >
            <Link href={routes.support.home}>
              <ArrowLeft className="mr-2 size-4" />
              Volver
            </Link>
          </Button>

          {loading && !support ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-40 w-full rounded-2xl" />
            </div>
          ) : error || !support ? (
            <Card className="rounded-2xl border-gray-100 shadow-sm">
              <CardContent className="py-10 text-center space-y-2">
                <CircleX className="size-10 text-red-500 mx-auto" />
                <p className="text-sm text-gray-600">
                  No pudimos cargar el reclamo.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Header */}
              <Card className="rounded-2xl border-gray-100 shadow-sm">
                <CardHeader className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <CardTitle className="text-primary">
                        {support.topic}
                      </CardTitle>
                      <p className="text-xs text-gray-500">
                        Abierto el {formatDateTime(support.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                          STATUS_CLASSES[support.status],
                        )}
                      >
                        {STATUS_LABELS[support.status]}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          PRIORITY_CLASSES[support.priority],
                        )}
                      >
                        {PRIORITY_LABELS[support.priority]}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    {support.category?.name && (
                      <Field
                        label="Categoría"
                        value={support.category.name}
                      />
                    )}
                    {support.place && (
                      <Field label="Lugar" value={support.place} />
                    )}
                    {support.assignedName && (
                      <Field
                        label="Asignado a"
                        value={
                          <span className="flex items-center gap-1.5">
                            <UserCheck className="size-3.5 text-primary" />
                            {support.assignedName}
                          </span>
                        }
                      />
                    )}
                    {support.resolvedAt && (
                      <Field
                        label="Resuelto"
                        value={formatDateTime(support.resolvedAt)}
                      />
                    )}
                  </div>

                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-gray-400 uppercase tracking-wide font-semibold text-[10px]">
                      Detalle
                    </p>
                    <p className="text-gray-700 mt-1 whitespace-pre-wrap">
                      {support.details}
                    </p>
                  </div>

                  {support.status === "RESOLVED" && (
                    <div className="rounded-xl border border-green-200 bg-green-50 p-3 space-y-1.5">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle2 className="size-4" />
                        <p className="text-sm font-semibold">
                          Reclamo resuelto
                          {support.resolvedAt &&
                            ` · ${formatDateTime(support.resolvedAt)}`}
                        </p>
                      </div>
                      {resolutionMessage && (
                        <p className="text-sm text-green-800 line-clamp-3 whitespace-pre-wrap">
                          “{resolutionMessage.body}”
                        </p>
                      )}
                    </div>
                  )}

                  {support.status === "REJECTED" && support.rejectReason && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-red-600">
                        Motivo de rechazo
                      </p>
                      <p className="text-sm text-red-700 mt-1">
                        {support.rejectReason}
                      </p>
                    </div>
                  )}

                  {support.status === "REOPENED" && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 space-y-1">
                      <p className="text-sm font-semibold text-amber-800">
                        Reclamo reabierto, esperando nueva atención
                      </p>
                      {support.reopenReason && (
                        <p className="text-xs text-gray-600 italic">
                          “{support.reopenReason}”
                        </p>
                      )}
                    </div>
                  )}

                  {support.satisfactionRating && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                        Tu calificación
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            className={cn(
                              "size-4",
                              n <= (support.satisfactionRating ?? 0)
                                ? "fill-amber-400 text-amber-400"
                                : "text-gray-300",
                            )}
                          />
                        ))}
                      </div>
                      {support.satisfactionComment && (
                        <p className="text-sm text-gray-700 mt-2">
                          {support.satisfactionComment}
                        </p>
                      )}
                    </div>
                  )}

                  {(canRate || canReopen) && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {canRate && (
                        <Button
                          size="sm"
                          onClick={() => setOpenRate(true)}
                          className="bg-accent hover:bg-accent-hover text-white"
                        >
                          <Star className="mr-1.5 size-4" />
                          Calificar
                        </Button>
                      )}
                      {canReopen && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setOpenReopen(true)}
                        >
                          <RefreshCw className="mr-1.5 size-4" />
                          Reabrir
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Thread */}
              <Card className="rounded-2xl border-gray-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base text-primary">
                    Conversación
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {visibleMessages.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-6">
                      Aún no hay mensajes en este reclamo.
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                      {visibleMessages.map((m) => (
                        <MessageBubble key={m.id} message={m} />
                      ))}
                      <div ref={threadEndRef} />
                    </div>
                  )}

                  {canReply ? (
                    <div className="space-y-2 border-t border-gray-100 pt-3">
                      <Textarea
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder="Escribe una respuesta..."
                        rows={3}
                        disabled={sending}
                      />
                      <AttachmentsPicker
                        files={replyFiles}
                        onChange={setReplyFiles}
                        max={MAX_ATTACHMENTS}
                        disabled={sending}
                      />
                      <div className="flex justify-end">
                        <Button
                          onClick={handleSend}
                          disabled={!canSendReply}
                          className="bg-accent hover:bg-accent-hover text-white"
                        >
                          {sending ? (
                            <Loader2 className="mr-2 size-4 animate-spin" />
                          ) : (
                            <Send className="mr-2 size-4" />
                          )}
                          Enviar
                        </Button>
                      </div>
                    </div>
                  ) : isClosed ? (
                    <p className="text-xs text-gray-400 text-center border-t border-gray-100 pt-3">
                      Este reclamo está cerrado y es solo lectura.
                    </p>
                  ) : status === "REJECTED" ? (
                    <p className="text-xs text-gray-400 text-center border-t border-gray-100 pt-3">
                      Este reclamo está rechazado. Si quieres continuar,
                      reábrelo para enviar nuevos mensajes.
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>

      <Footer />

      {support && (
        <>
          <RateDialog
            open={openRate}
            onClose={() => setOpenRate(false)}
            supportId={support.id}
            onSuccess={() => refetch()}
          />
          <ReopenDialog
            open={openReopen}
            onClose={() => setOpenReopen(false)}
            supportId={support.id}
            onSuccess={() => refetch()}
          />
        </>
      )}
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-gray-400 uppercase tracking-wide font-semibold text-[10px]">
        {label}
      </p>
      <p className="text-gray-700 mt-0.5">{value}</p>
    </div>
  );
}

function MessageBubble({ message }: { message: SupportMessage }) {
  const isMember = message.author?.role === "MEMBER";
  const authorName =
    `${message.author?.name ?? ""} ${message.author?.paternalSurname ?? ""}`.trim() ||
    "Soporte";
  return (
    <div className={cn("flex", isMember ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
          isMember
            ? "bg-primary text-white rounded-br-sm"
            : "bg-gray-100 text-gray-800 rounded-bl-sm",
        )}
      >
        <p
          className={cn(
            "text-[10px] font-semibold uppercase tracking-wide mb-1",
            isMember ? "text-white/70" : "text-gray-500",
          )}
        >
          {authorName}
        </p>
        <p className="whitespace-pre-wrap">{message.body}</p>

        {message.attachments && message.attachments.length > 0 && (
          <AttachmentGrid
            attachments={message.attachments}
            onDark={isMember}
          />
        )}

        <p
          className={cn(
            "text-[10px] mt-1 text-right",
            isMember ? "text-white/60" : "text-gray-400",
          )}
        >
          {formatDateTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}

function AttachmentGrid({
  attachments,
  onDark,
}: {
  attachments: SupportAttachment[];
  onDark: boolean;
}) {
  const sorted = [...attachments].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );
  return (
    <div className="mt-2 grid grid-cols-2 gap-1.5">
      {sorted.map((a) => {
        const m = a.media;
        if (isImage(m.format)) {
          return (
            <a
              key={a.mediaId}
              href={m.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-lg bg-black/10"
              title={m.title ?? undefined}
            >
              {/* Plain <img> keeps it simple for media that lives on Cloudinary; */}
              {/* next/image would require domain config. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={m.url}
                alt={m.title ?? "Adjunto"}
                className="h-24 w-full object-cover"
              />
            </a>
          );
        }
        return (
          <a
            key={a.mediaId}
            href={m.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs hover:opacity-90",
              onDark
                ? "bg-white/10 text-white"
                : "bg-white text-gray-700 border border-gray-200",
            )}
            title={m.title ?? undefined}
          >
            <FileText className="size-3.5 shrink-0" />
            <span className="truncate">
              {m.title || `Adjunto ${a.mediaId}`}
            </span>
          </a>
        );
      })}
    </div>
  );
}

function RateDialog({
  open,
  onClose,
  supportId,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  supportId: number;
  onSuccess: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [rateSupport, { loading }] = useMutation(RATE_SUPPORT_RESOLUTION);

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) return;
    try {
      await rateSupport({
        variables: {
          input: {
            supportId,
            rating,
            ...(comment.trim() ? { comment: comment.trim() } : {}),
          },
        },
      });
      toast.success("Gracias por tu calificación.");
      onClose();
      onSuccess();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "No se pudo guardar la calificación.",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-primary">
            Calificar resolución
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm text-gray-700">Calificación</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className="p-1"
                >
                  <Star
                    className={cn(
                      "size-7 transition-colors",
                      n <= rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300 hover:text-amber-300",
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm text-gray-700">
              Comentario{" "}
              <span className="text-gray-400 font-normal">(opcional)</span>
            </Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Cuéntanos cómo fue tu experiencia"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={rating < 1 || loading}
            className="bg-accent hover:bg-accent-hover text-white"
          >
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReopenDialog({
  open,
  onClose,
  supportId,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  supportId: number;
  onSuccess: () => void;
}) {
  const [reason, setReason] = useState("");
  const [reopen, { loading }] = useMutation(REOPEN_SUPPORT);

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    try {
      await reopen({
        variables: {
          input: { supportId, reopenReason: reason.trim() },
        },
      });
      toast.success("El reclamo fue reabierto.");
      onClose();
      setReason("");
      onSuccess();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "No se pudo reabrir el reclamo.",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-primary">Reabrir reclamo</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Label className="text-sm text-gray-700">
            Cuéntanos por qué deseas reabrir este reclamo
          </Label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="Motivo de la reapertura"
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason.trim() || loading}
            className="bg-accent hover:bg-accent-hover text-white"
          >
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Reabrir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
