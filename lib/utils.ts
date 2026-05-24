import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Extend tailwind-merge so it recognizes custom color tokens (primary, accent, etc.)
// Without this, twMerge keeps BOTH bg-slate-900 and bg-primary in the output,
// and CSS ordering makes bg-slate-900 win unpredictably.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "bg-color": [
        {
          bg: [
            "primary",
            "primary-light",
            "accent",
            "accent-hover",
            "secondary",
            "foreground",
            "body",
          ],
        },
      ],
      "text-color": [
        {
          text: [
            "primary",
            "primary-light",
            "accent",
            "accent-hover",
            "secondary",
            "foreground",
          ],
        },
      ],
      "border-color": [
        {
          border: [
            "primary",
            "primary-light",
            "accent",
            "accent-hover",
            "secondary",
            "foreground",
          ],
        },
      ],
      "ring-color": [
        {
          ring: [
            "primary",
            "primary-light",
            "accent",
            "accent-hover",
            "secondary",
            "foreground",
          ],
        },
      ],
    },
  },
});
import ShortUniqueId from "short-unique-id";
import { format, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateOrderNumber = () => {
  const date = new Date();
  const ymd = date.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${ymd}-${rand}`;
};

export const generateTransactionId = () => {
  const transactionIdGen = new ShortUniqueId({
    length: 15,
    dictionary: "alphanum_upper",
  });
  return transactionIdGen.rnd();
};

export const formatDate = (date: string) => {
  if (!date) {
    return "";
  }
  const parsedDate = new Date(date);
  return format(parsedDate, "dd/MM/yyyy  h:mm a", { locale: es });
};

export const formatDateWithOutTime = (date: string) => {
  if (!date) {
    return "";
  }
  const parsedDate = new Date(date);
  return format(parsedDate, "P", { locale: es });
};

export function formatDateRange(startISOString: string, endISOString: string) {
  try {
    const startDate = new Date(startISOString);
    const endDate = new Date(endISOString);

    if (isSameDay(startDate, endDate)) {
      return format(startDate, "dd MMM, yyyy", { locale: es });
    }

    // aca que sea dd MMM - dd MMM, yyyy
    const startFormat = format(startDate, "dd MMM", { locale: es });
    const endFormat = format(endDate, "dd MMM, yyyy", { locale: es });
    return `${startFormat} - ${endFormat}`;
  } catch {
    return "";
  }
}

export function formatTimeRange(startISOString: string, endISOString: string) {
  try {
    const startDate = new Date(startISOString);
    const endDate = new Date(endISOString);

    const startTime = format(startDate, "hh:mm a", { locale: es });
    const endTime = format(endDate, "hh:mm a", { locale: es });

    return `${startTime} - ${endTime}`;
  } catch {
    return "";
  }
}

export function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}
