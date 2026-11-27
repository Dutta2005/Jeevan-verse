import { useRef, useState, useEffect, useCallback } from "react";
import { Paperclip, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  selectedFile: File | null;
  onClearFile: () => void;
}

export default function FileUpload({
  onFileSelect,
  isUploading,
  selectedFile,
  onClearFile,
}: FileUploadProps) {
  const input = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const previewImage = useRef<HTMLImageElement>(null);
  useEffect(() => {
    if (!selectedFile?.type.startsWith("image/")) return;
    const url = URL.createObjectURL(selectedFile);
    previewImage.current?.setAttribute("src", url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);
  const selectFile = useCallback(
    (file?: File) => {
      if (
        !isUploading &&
        file &&
        ["image/jpeg", "image/png", "image/webp", "image/jpg", "application/pdf"].includes(
          file.type,
        )
      )
        onFileSelect(file);
    },
    [isUploading, onFileSelect],
  );
  const size = selectedFile
    ? selectedFile.size < 1024
      ? `${selectedFile.size} B`
      : selectedFile.size < 1024 * 1024
        ? `${(selectedFile.size / 1024).toFixed(1)} KB`
        : `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
    : "";
  return (
    <div
      className="relative shrink-0"
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setIsDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        selectFile(event.dataTransfer.files?.[0]);
      }}
    >
      <input
        ref={input}
        type="file"
        aria-label="Prescription file"
        accept="image/jpeg,image/png,image/webp,image/jpg,application/pdf"
        className="hidden"
        disabled={isUploading}
        onChange={(event) => {
          selectFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      <Button
        type="button"
        variant={isDragging ? "outline" : "ghost"}
        size="icon"
        aria-label="Upload prescription"
        title="Upload prescription (Image or PDF)"
        disabled={isUploading}
        onClick={() => input.current?.click()}
      >
        <Paperclip aria-hidden="true" />
      </Button>
      {isDragging && (
        <span role="status" className="sr-only">
          Drop prescription here
        </span>
      )}
      {selectedFile && (
        <div className="absolute bottom-full left-0 mb-2 flex w-64 max-w-[calc(100vw-3rem)] flex-col gap-2 rounded-xl border bg-popover p-3 text-popover-foreground shadow-sm">
          <div className="flex items-center gap-3">
            {selectedFile.type.startsWith("image/") ? (
              <img
                ref={previewImage}
                alt="Preview"
                className="size-10 shrink-0 rounded-md object-cover"
              />
            ) : (
              <FileText aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">{size}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Remove prescription"
              disabled={isUploading}
              onClick={onClearFile}
            >
              <X aria-hidden="true" />
            </Button>
          </div>
          {isUploading && (
            <p role="status" className="text-xs text-muted-foreground">
              Analyzing prescription…
            </p>
          )}
        </div>
      )}
    </div>
  );
}
