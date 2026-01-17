"use client";

import { useState, useCallback } from "react";
import { Upload, FileImage, FileText, Link2, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FinPromUploadProps {
  onFileSelect: (file: File) => void;
  onUrlSubmit: (url: string) => void;
  onCancel: () => void;
  isAnalyzing: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const SUPPORTED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "application/pdf",
];

export function FinPromUpload({
  onFileSelect,
  onUrlSubmit,
  onCancel,
  isAnalyzing,
}: FinPromUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [url, setUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (!SUPPORTED_TYPES.includes(file.type)) {
      return "File type not supported. Please upload PNG, JPG, WEBP, or PDF files.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File is too large. Maximum size is 10MB.";
    }
    return null;
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      setError(null);
      setSelectedFile(file);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      setError(null);
      setSelectedFile(file);
    }
  };

  const handleSubmit = () => {
    if (uploadMode === "file" && selectedFile) {
      onFileSelect(selectedFile);
    } else if (uploadMode === "url" && url.trim()) {
      onUrlSubmit(url.trim());
    }
  };

  const getFileIcon = (type: string) => {
    if (type === "application/pdf") {
      return <FileText className="h-8 w-8 text-red-500" />;
    }
    return <FileImage className="h-8 w-8 text-blue-500" />;
  };

  return (
    <div className="space-y-4">
      {/* Upload Mode Tabs */}
      <div className="flex gap-2 border-b">
        <button
          type="button"
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors",
            uploadMode === "file"
              ? "border-b-2 border-teal-600 text-teal-600"
              : "text-slate-500 hover:text-slate-700"
          )}
          onClick={() => setUploadMode("file")}
          disabled={isAnalyzing}
        >
          Upload File
        </button>
        <button
          type="button"
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors",
            uploadMode === "url"
              ? "border-b-2 border-teal-600 text-teal-600"
              : "text-slate-500 hover:text-slate-700"
          )}
          onClick={() => setUploadMode("url")}
          disabled={isAnalyzing}
        >
          Paste URL
        </button>
      </div>

      {/* File Upload */}
      {uploadMode === "file" && (
        <div className="space-y-4">
          <div
            className={cn(
              "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
              isDragging
                ? "border-teal-400 bg-teal-50"
                : "border-slate-300 hover:border-slate-400",
              isAnalyzing && "pointer-events-none opacity-50"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="flex flex-col items-center gap-2">
                {getFileIcon(selectedFile.type)}
                <p className="text-sm font-medium text-slate-700">{selectedFile.name}</p>
                <p className="text-xs text-slate-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                  className="text-red-600 hover:text-red-700"
                  disabled={isAnalyzing}
                >
                  <X className="mr-1 h-4 w-4" />
                  Remove
                </Button>
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 text-slate-400" />
                <p className="mt-2 text-sm font-medium text-slate-700">
                  Drop your promotion here or click to upload
                </p>
                <p className="text-xs text-slate-500">
                  Supports: PDF, PNG, JPG, WEBP (max 10MB)
                </p>
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp,.pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 cursor-pointer opacity-0"
                  disabled={isAnalyzing}
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* URL Input */}
      {uploadMode === "url" && (
        <div className="space-y-2">
          <Label>Promotion URL</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/promotion"
                className="pl-10"
                disabled={isAnalyzing}
              />
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Enter the URL of a web-based financial promotion to analyze
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel} disabled={isAnalyzing}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={
            isAnalyzing ||
            (uploadMode === "file" && !selectedFile) ||
            (uploadMode === "url" && !url.trim())
          }
          className="bg-teal-600 hover:bg-teal-700"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Analyze Promotion
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
