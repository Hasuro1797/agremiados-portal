"use client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { AlertTriangle, CheckCircle, Loader2, XCircle } from "lucide-react";
import { PaymentStatus } from "../CheckoutDetail";
// import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import Link from "next/link";

interface StepPaymentResultProps {
  paymentStatus: PaymentStatus;
  transactionId: string;
  total: number;
  orderError: string | null;
}

export default function StepPaymentResult({
  paymentStatus,
  transactionId,
  total,
  orderError,
}: StepPaymentResultProps) {
  // const [isDownloading, setIsDownloading] = useState(false);
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // const handleDownloadReceipt = async () => {
  //   setIsDownloading(true);

  //   try {
  //     await new Promise((resolve) => setTimeout(resolve, 2000)); // Simula una descarga de 2 segundos
  //   } catch (error) {
  //     console.error("Error al descargar:", error);
  //   } finally {
  //     setIsDownloading(false);
  //   }
  // };

  return (
    <div className="space-y-6">
      {paymentStatus === "processing" && (
        <Card>
          <CardContent className="pt-6 h-[calc(90vh_-_88px)] flex flex-col justify-center items-center">
            <div className="text-center space-y-4">
              <div className="size-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Procesando su pago...</h3>
                <p className="text-gray-600 max-w-xl">
                  Por favor espere mientras procesamos su transacción. Este
                  proceso puede tomar unos momentos.
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full animate-pulse"
                  style={{ width: "60%" }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {paymentStatus === "success" && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-green-800 mb-2">
                  ¡Pago Exitoso!
                </h3>
                <p className="text-gray-600 mb-4">
                  Su pago ha sido procesado correctamente. Su comprobante
                  electrónico (boleta o factura) será enviado a su correo
                  electrónico registrado en un plazo de{" "}
                  <span className="font-semibold text-green-800">
                    24 a 48 horas hábiles
                  </span>
                  .
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">ID de Transacción:</p>
                      <p className="font-mono font-semibold text-green-800">
                        {transactionId}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Fecha y Hora:</p>
                      <p className="font-semibold text-green-800">
                        {format(new Date(), "dd/MM/yyyy HH:mm:ss")}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Monto Total:</p>
                      <p className="font-semibold text-green-800">
                        {formatCurrency(total)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Estado:</p>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        Aprobado
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                {/* <Button
                  onClick={handleDownloadReceipt}
                  disabled={isDownloading}
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-3"
                >
                  {isDownloading ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Descargando...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Descargar Boleta
                    </>
                  )}
                </Button> */}
                <Link
                  href={routes.home}
                  className="block mt-2 text-xs text-gray-500 text-center"
                >
                  Ir a la página principal
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {paymentStatus === "canceled" && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="h-12 w-12 text-orange-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-orange-800 mb-2">
                  Pago Cancelado
                </h3>
                <p className="text-gray-600 mb-4">
                  Su transacción ha sido cancelada. No se ha realizado ningún
                  cargo a su método de pago.
                </p>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                  <div className="text-left space-y-2">
                    <h4 className="font-semibold text-orange-800">
                      Posibles razones:
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1 ml-4">
                      <li>• Cancelación voluntaria del usuario</li>
                      <li>• Tiempo de sesión agotado</li>
                      <li>• Cierre de ventana durante el proceso</li>
                      <li>• Interrupción en la conexión</li>
                    </ul>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Si desea realizar el pago, puede intentar nuevamente desde el
                  inicio.
                </p>
              </div>
              <Link
                href={routes.home}
                className="text-orange-700 hover:underline text-xs"
              >
                Volver a la página principal
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
      {paymentStatus === "izipayError" && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="h-12 w-12 text-red-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-red-800 mb-2">
                  Pago Rechazado
                </h3>
                <p className="text-gray-600 mb-4">
                  Su pago no pudo ser procesado por el servicio de pagos. No se
                  ha realizado ningún cargo a su método de pago.
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="text-left space-y-2">
                    <h4 className="font-semibold text-red-800">
                      Qué puede hacer:
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1 ml-4">
                      <li>
                        • Verificar que los datos de su tarjeta sean correctos
                      </li>
                      <li>
                        • Comprobar que su tarjeta tenga fondos suficientes
                      </li>
                      <li>• Intentar con otra tarjeta o método de pago</li>
                      <li>
                        • Verificar que su tarjeta esté habilitada para pagos en
                        línea
                      </li>
                    </ul>
                  </div>
                </div>
                {orderError && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-xs text-gray-500">
                      <strong>Detalle:</strong> {orderError}
                    </p>
                  </div>
                )}
              </div>
              <Link
                href={routes.home}
                className="text-red-700 hover:underline text-xs"
              >
                Volver a la página principal
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
      {paymentStatus === "serverError" && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="h-12 w-12 text-orange-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-orange-800 mb-2">
                  Error al Registrar el Pago
                </h3>
                <p className="text-gray-600 mb-4">
                  Ocurrió un problema al registrar su transacción en nuestro
                  sistema. Es posible que{" "}
                  <span className="font-semibold text-orange-800">
                    el cargo haya sido generado
                  </span>
                  {
                    '. Verifique su estado de cuenta antes de intentar un nuevpago. Si fuese el caso que el cargo haya sido generado, espere 20 a 30 minutos y verifique el estado de su pago en la sección de "Mis Pagos" o comuníquese con soporte para asistencia. Caso contrario, omita este mensaje y proceda a realizar un nuevo intento de pago.'
                  }
                </p>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="text-left space-y-2">
                    <h4 className="font-semibold text-orange-800">
                      Acción requerida:
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1 ml-4">
                      <li>
                        • Comuníquese con el Colegio de Abogados de Arequipa
                        para verificar el estado de su pago
                      </li>
                      <li>
                        • Proporcione la fecha y hora de este intento de pago al
                        momento de contactar soporte
                      </li>
                      <li>
                        • No realice un nuevo pago hasta confirmar el estado del
                        actual
                      </li>
                    </ul>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  Fecha y hora del intento:{" "}
                  {format(new Date(), "dd/MM/yyyy HH:mm:ss")}
                </p>
              </div>
              <Link
                href={routes.home}
                className="text-orange-700 hover:underline text-xs"
              >
                Volver a la página principal
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
