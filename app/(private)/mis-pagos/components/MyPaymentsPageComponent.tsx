"use client";

import Footer from "@/components/Footer";
import HomeNavbar from "@/components/home/HomeNavbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MY_PAYMENTS } from "@/graphql/query/invoice.query";
import { cn } from "@/lib/utils";
import {
  BillingDocument,
  InvoiceItemType,
  InvoiceStatus,
  MyPayment,
} from "@/types/invoice.type";
import { useQuery } from "@apollo/client";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { get } from "lodash";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Loader2,
  ReceiptText,
} from "lucide-react";
import { useMemo, useState } from "react";

const PAGE_SIZE = 10;

type TabKey = "ALL" | "QUOTA" | "ACTIVITY_ATTENDEE";

const TAB_LABELS: Record<TabKey, string> = {
  ALL: "Todos",
  QUOTA: "Cuotas",
  ACTIVITY_ATTENDEE: "Actividades",
};

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  PENDIENTE: "Pendiente",
  PAGADO: "Pagado",
  FACTURADO: "Facturado",
  EXPIRADO: "Expirado",
  CANCELADO: "Cancelado",
  FALLIDO: "Fallido",
};

const STATUS_CLASSES: Record<InvoiceStatus, string> = {
  PAGADO: "bg-green-50 text-green-700 border-green-200",
  FACTURADO: "bg-green-50 text-green-700 border-green-200",
  CANCELADO: "bg-red-50 text-red-700 border-red-200",
  FALLIDO: "bg-red-50 text-red-700 border-red-200",
  PENDIENTE: "bg-gray-100 text-gray-600 border-gray-200",
  EXPIRADO: "bg-gray-100 text-gray-600 border-gray-200",
};

const formatCurrency = (amount: number, currency = "PEN") =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);

const formatDate = (iso: string) => {
  try {
    return format(parseISO(iso), "dd MMM yyyy", { locale: es });
  } catch {
    return iso;
  }
};

const getPdf = (docs: BillingDocument[] = []) =>
  docs.find((d) => d.type === "PDF");

const getReceiptNumber = (p: MyPayment) =>
  p.series && p.sequential ? `${p.series}-${p.sequential}` : p.orderNumber;

const getItemBadges = (details: MyPayment["details"]) => {
  const types = new Set<InvoiceItemType>(details.map((d) => d.itemType));
  const badges: { key: string; label: string; className: string }[] = [];
  if (types.has("QUOTA")) {
    badges.push({
      key: "QUOTA",
      label: "Cuota",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    });
  }
  if (types.has("ACTIVITY_ATTENDEE")) {
    badges.push({
      key: "ACTIVITY_ATTENDEE",
      label: "Actividad",
      className: "bg-purple-50 text-purple-700 border-purple-200",
    });
  }
  if (badges.length === 0 && types.has("OTHER")) {
    badges.push({
      key: "OTHER",
      label: "Otro",
      className: "bg-gray-100 text-gray-700 border-gray-200",
    });
  }
  return badges;
};

const getConceptLabel = (details: MyPayment["details"]) => {
  if (!details.length) return "Sin detalle";
  if (details.length === 1) return details[0].description;
  return `${details.length} conceptos`;
};

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [];
  pages.push(1);
  if (current > 3) pages.push("...");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i);
  }
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

export default function MyPaymentsPageComponent() {
  const [tab, setTab] = useState<TabKey>("ALL");
  const [status, setStatus] = useState<InvoiceStatus | "ALL">("ALL");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<MyPayment | null>(null);

  const variables = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      ...(status !== "ALL" ? { status } : {}),
      ...(tab !== "ALL" ? { itemType: tab } : {}),
      ...(dateFrom ? { dateFrom: new Date(dateFrom).toISOString() } : {}),
      ...(dateTo ? { dateTo: new Date(dateTo).toISOString() } : {}),
    }),
    [page, status, tab, dateFrom, dateTo],
  );

  const { data, loading, error } = useQuery(MY_PAYMENTS, {
    variables,
    fetchPolicy: "cache-and-network",
  });

  const payments = (get(data, "myPayments.data", []) as MyPayment[]) ?? [];
  const totalPages = get(data, "myPayments.meta.totalPages", 1) as number;
  const total = get(data, "myPayments.meta.total", 0) as number;

  const resetPageOnFilterChange = () => setPage(1);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HomeNavbar />

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          <header className="space-y-1">
            <h1 className="text-2xl font-bold text-primary">Mis pagos</h1>
            <p className="text-sm text-gray-500">
              Consulta el historial de tus comprobantes y descarga tus boletas.
            </p>
          </header>

          {/* Filters */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
            <Tabs
              value={tab}
              onValueChange={(v) => {
                setTab(v as TabKey);
                resetPageOnFilterChange();
              }}
            >
              <TabsList className="bg-gray-100">
                {(Object.keys(TAB_LABELS) as TabKey[]).map((k) => (
                  <TabsTrigger
                    key={k}
                    value={k}
                    className="data-[state=active]:bg-white data-[state=active]:text-primary"
                  >
                    {TAB_LABELS[k]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-600">Estado</Label>
                <Select
                  value={status}
                  onValueChange={(v) => {
                    setStatus(v as InvoiceStatus | "ALL");
                    resetPageOnFilterChange();
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos</SelectItem>
                    {(
                      Object.keys(STATUS_LABELS) as InvoiceStatus[]
                    ).map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-600">Desde</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    resetPageOnFilterChange();
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-600">Hasta</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    resetPageOnFilterChange();
                  }}
                />
              </div>
            </div>
          </div>

          {/* List */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {loading && payments.length === 0 ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-xl" />
                ))}
              </div>
            ) : error ? (
              <div className="p-10 text-center text-sm text-red-600">
                Ocurrió un error al cargar tus pagos. Inténtalo nuevamente.
              </div>
            ) : payments.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <ReceiptText className="size-10 text-primary/30 mx-auto" />
                <p className="text-sm font-semibold text-primary">
                  Aún no tienes pagos registrados
                </p>
                <p className="text-xs text-gray-500">
                  Cuando realices un pago, aparecerá aquí con su comprobante.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {payments.map((p) => (
                  <PaymentRow
                    key={p.id}
                    payment={p}
                    onOpen={() => setSelected(p)}
                  />
                ))}
              </ul>
            )}

            {payments.length > 0 && (
              <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
                <p className="text-xs text-gray-500">
                  {total} {total === 1 ? "pago" : "pagos"} en total
                </p>
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onChange={setPage}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      <PaymentDetailDialog
        payment={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}

function PaymentRow({
  payment,
  onOpen,
}: {
  payment: MyPayment;
  onOpen: () => void;
}) {
  const pdf = getPdf(payment.billingDocuments);
  const badges = getItemBadges(payment.details);
  const issued =
    payment.status === "PAGADO" || payment.status === "FACTURADO";

  return (
    <li className="px-4 sm:px-5 py-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-primary" />
              {formatDate(payment.createdAt)}
            </p>
            {badges.map((b) => (
              <Badge
                key={b.key}
                variant="outline"
                className={cn("text-[10px] font-semibold", b.className)}
              >
                {b.label}
              </Badge>
            ))}
          </div>
          <p className="text-sm font-medium text-primary line-clamp-1">
            {getConceptLabel(payment.details)}
          </p>
          <p className="text-[11px] text-gray-400">
            {getReceiptNumber(payment)}
          </p>
        </div>

        <div className="text-right shrink-0 space-y-1">
          <p className="text-base font-bold text-primary">
            {formatCurrency(payment.total, payment.currency)}
          </p>
          <span
            className={cn(
              "inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold",
              STATUS_CLASSES[payment.status],
            )}
          >
            {STATUS_LABELS[payment.status]}
          </span>
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          {pdf ? (
            <Button
              asChild
              size="sm"
              className="bg-accent hover:bg-accent-hover text-white"
            >
              <a href={pdf.url} target="_blank" rel="noopener noreferrer">
                <Download className="mr-1 size-4" />
                Boleta
              </a>
            </Button>
          ) : issued ? (
            <Button
              size="sm"
              variant="outline"
              disabled
              className="text-xs"
              title="El comprobante aún está en emisión"
            >
              <Loader2 className="mr-1 size-3.5 animate-spin" />
              En emisión
            </Button>
          ) : null}
          <Button
            size="sm"
            variant="ghost"
            onClick={onOpen}
            className="text-xs text-gray-600 hover:text-primary"
          >
            <Eye className="mr-1 size-4" />
            Detalle
          </Button>
        </div>
      </div>
    </li>
  );
}

function PaymentDetailDialog({
  payment,
  onClose,
}: {
  payment: MyPayment | null;
  onClose: () => void;
}) {
  const pdf = payment ? getPdf(payment.billingDocuments) : undefined;
  return (
    <Dialog open={!!payment} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        {payment && (
          <>
            <DialogHeader>
              <DialogTitle className="text-primary">
                Comprobante {getReceiptNumber(payment)}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Fecha</span>
                <span className="text-gray-700">
                  {formatDate(payment.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Estado</span>
                <span
                  className={cn(
                    "inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                    STATUS_CLASSES[payment.status],
                  )}
                >
                  {STATUS_LABELS[payment.status]}
                </span>
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Detalle
                </p>
                {payment.details.map((d, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between gap-3 text-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-700 line-clamp-2">
                        {d.description}
                      </p>
                      {d.quantity > 1 && (
                        <p className="text-[11px] text-gray-400">
                          {d.quantity} × {formatCurrency(d.price, payment.currency)}
                        </p>
                      )}
                    </div>
                    <span className="font-medium text-primary shrink-0">
                      {formatCurrency(d.price * d.quantity, payment.currency)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="text-sm font-bold text-gray-700">Total</span>
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(payment.total, payment.currency)}
                </span>
              </div>

              {pdf && (
                <Button
                  asChild
                  className="w-full bg-accent hover:bg-accent-hover"
                >
                  <a href={pdf.url} target="_blank" rel="noopener noreferrer">
                    <FileText className="mr-2 size-4" />
                    Descargar boleta (PDF)
                  </a>
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  const numbers = getPageNumbers(page, totalPages);
  return (
    <div className="flex items-center gap-1">
      <Button
        size="icon"
        variant="ghost"
        className="size-8"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <ChevronLeft className="size-4" />
      </Button>
      {numbers.map((n, i) =>
        n === "..." ? (
          <span key={`dots-${i}`} className="px-2 text-xs text-gray-400">
            …
          </span>
        ) : (
          <Button
            key={n}
            size="sm"
            variant={n === page ? "default" : "ghost"}
            className={cn(
              "size-8 p-0 text-xs",
              n === page && "bg-primary text-white hover:bg-primary",
            )}
            onClick={() => onChange(n)}
          >
            {n}
          </Button>
        ),
      )}
      <Button
        size="icon"
        variant="ghost"
        className="size-8"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
