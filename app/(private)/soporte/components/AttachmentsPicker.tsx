"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileText, Image as ImageIcon, Paperclip, X } from "lucide-react";
import { useRef } from "react";

interface AttachmentsPickerProps {
  files: File[];
  onChange: (files: File[]) => void;
  max?: number;
  accept?: string;
  disabled?: boolean;
}

const DEFAULT_ACCEPT = "image/*,application/pdf";

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function AttachmentsPicker({
  files,
  onChange,
  max = 10,
  accept = DEFAULT_ACCEPT,
  disabled = false,
}: AttachmentsPickerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handlePick = (incoming: FileList | null) => {
    if (!incoming || incoming.length === 0) return;
    const merged = [...files, ...Array.from(incoming)].slice(0, max);
    onChange(merged);
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeAt = (index: number) =>
    onChange(files.filter((_, i) => i !== index));

  const reached = files.length >= max;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || reached}
        >
          <Paperclip className="mr-1.5 size-4" />
          Adjuntar
        </Button>
        <span className="text-xs text-gray-400">
          {files.length}/{max}
        </span>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={(e) => handlePick(e.target.files)}
          disabled={disabled}
        />
      </div>

      {files.length > 0 && (
        <ul className="space-y-1.5">
          {files.map((f, i) => {
            const isImage = f.type.startsWith("image/");
            return (
              <li
                key={`${f.name}-${i}`}
                className={cn(
                  "flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-1.5 text-xs",
                )}
              >
                {isImage ? (
                  <ImageIcon className="size-3.5 text-primary" />
                ) : (
                  <FileText className="size-3.5 text-primary" />
                )}
                <span className="flex-1 min-w-0 truncate text-gray-700">
                  {f.name}
                </span>
                <span className="text-gray-400">{formatSize(f.size)}</span>
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  className="text-gray-400 hover:text-red-500 p-0.5"
                  disabled={disabled}
                  aria-label={`Quitar ${f.name}`}
                >
                  <X className="size-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
