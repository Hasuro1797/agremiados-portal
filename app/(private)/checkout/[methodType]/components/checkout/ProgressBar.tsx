import { Check, X, AlertTriangle } from "lucide-react";
import { PaymentStatus } from "../CheckoutDetail";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
  paymentStatus?: PaymentStatus;
}

export function ProgressBar({
  currentStep,
  totalSteps,
  stepLabels,
  paymentStatus,
}: ProgressBarProps) {
  const getStepStatus = (stepNumber: number) => {
    if (stepNumber < currentStep) return "completed";
    if (stepNumber === currentStep) {
      // Si estamos en el último paso, usar el estado del pago
      if (stepNumber === totalSteps && paymentStatus) {
        switch (paymentStatus) {
          case "success":
            return "success";
          case "serverError":
          case "izipayError":
            return "error";
          case "canceled":
            return "canceled";
          case "processing":
            return "processing";
          default:
            return "current";
        }
      }
      return "current";
    }
    return "upcoming";
  };

  const getStepIcon = (stepNumber: number, status: string) => {
    switch (status) {
      case "completed":
      case "success":
        return <Check className="h-4 w-4" />;
      case "error":
        return <X className="h-4 w-4" />;
      case "canceled":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return stepNumber;
    }
  };

  const getStepStyles = (status: string) => {
    switch (status) {
      case "completed":
      case "success":
        return "bg-green-600 text-white shadow-green-200";
      case "error":
        return "bg-red-600 text-white shadow-red-200";
      case "canceled":
        return "bg-orange-600 text-white shadow-orange-200";
      case "processing":
        return "bg-blue-100 text-blue-600 border-2 border-blue-600 shadow-blue-100 animate-pulse";
      case "current":
        return "bg-blue-100 text-blue-600 border-2 border-blue-600 shadow-blue-100";
      default:
        return "bg-gray-200 text-gray-500";
    }
  };

  const getTextStyles = (status: string) => {
    switch (status) {
      case "completed":
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      case "canceled":
        return "text-orange-600";
      case "processing":
      case "current":
        return "text-blue-600";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="w-full">
      {/* Desktop Version */}
      <div className="hidden sm:block">
        <div className="flex items-center justify-center max-w-xl mx-auto">
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1;
            const status = getStepStatus(stepNumber);
            const isLastStep = stepNumber === totalSteps;

            return (
              <div key={stepNumber} className="flex items-center">
                {/* Step Circle and Label Container */}
                <div className="flex flex-col items-center">
                  {/* Step Circle */}
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 shadow-sm
                      ${getStepStyles(status)}
                    `}
                  >
                    {getStepIcon(stepNumber, status)}
                  </div>

                  {/* Step Label */}
                  <div className="mt-2 text-center">
                    <p
                      className={`
                        text-xs font-medium transition-colors duration-300 whitespace-nowrap
                        ${getTextStyles(status)}
                      `}
                    >
                      {stepLabels[index]}
                    </p>
                    {status === "current" && !isLastStep && (
                      <div className="mt-1 w-1.5 h-1.5 bg-blue-600 rounded-full mx-auto animate-pulse"></div>
                    )}
                  </div>
                </div>

                {/* Connector Line */}
                {stepNumber < totalSteps && (
                  <div className="flex-1 mx-3 mb-4">
                    <div
                      className={`
                        h-0.5 rounded-full transition-all duration-500 min-w-[60px]
                        ${
                          status === "completed" || status === "success"
                            ? "bg-green-600"
                            : status === "error"
                              ? "bg-red-600"
                              : status === "canceled"
                                ? "bg-orange-600"
                                : "bg-gray-300"
                        }
                      `}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Version */}
      <div className="sm:hidden">
        <div className="flex justify-center items-center gap-2 mb-2">
          <div className="text-xs text-gray-500">Paso</div>
          <div className="text-sm font-bold text-blue-600">{currentStep}</div>
          <div className="text-xs text-gray-500">de</div>
          <div className="text-sm font-bold text-gray-700">{totalSteps}</div>
        </div>

        {/* Current Step Label */}
        <div className="text-center mb-2">
          <p
            className={`
              text-sm font-medium
              ${getTextStyles(getStepStatus(currentStep))}
            `}
          >
            {stepLabels[currentStep - 1]}
          </p>
        </div>

        {/* Progress Bar Mobile */}
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className={`
              h-1.5 rounded-full transition-all duration-500
              ${
                currentStep === totalSteps && paymentStatus === "success"
                  ? "bg-green-600"
                  : currentStep === totalSteps &&
                      paymentStatus === "serverError"
                    ? "bg-red-600"
                    : currentStep === totalSteps && paymentStatus === "canceled"
                      ? "bg-orange-600"
                      : "bg-blue-600"
              }
            `}
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
