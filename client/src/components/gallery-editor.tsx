import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Upload, GripVertical, Image as ImageIcon, Plus, Link as LinkIcon } from "lucide-react";

interface GalleryEditorProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export default function GalleryEditor({ images, onChange, maxImages = 10 }: GalleryEditorProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files) return;
    
    const remainingSlots = maxImages - images.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    
    const newImages: string[] = [];
    
    for (const file of filesToProcess) {
      if (file.type.startsWith("image/")) {
        const base64 = await fileToBase64(file);
        newImages.push(base64);
      }
    }
    
    if (newImages.length > 0) {
      onChange([...images, ...newImages]);
    }
  }, [images, maxImages, onChange]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [handleFileSelect]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onChange(newImages);
  };

  const handleImageDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleImageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleImageDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const newImages = [...images];
      const [removed] = newImages.splice(draggedIndex, 1);
      newImages.splice(dragOverIndex, 0, removed);
      onChange(newImages);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleAddUrl = () => {
    if (urlInput.trim() && images.length < maxImages) {
      onChange([...images, urlInput.trim()]);
      setUrlInput("");
      setShowUrlInput(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Gallery Images ({images.length}/{maxImages})</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowUrlInput(!showUrlInput)}
            disabled={images.length >= maxImages}
          >
            <LinkIcon className="w-4 h-4 mr-1" />
            Add URL
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={images.length >= maxImages}
          >
            <Upload className="w-4 h-4 mr-1" />
            Upload
          </Button>
        </div>
      </div>

      {showUrlInput && (
        <div className="flex gap-2">
          <Input
            placeholder="Paste image URL..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddUrl()}
          />
          <Button type="button" size="sm" onClick={handleAddUrl}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      <div
        className={`
          border-2 border-dashed rounded-lg p-4 transition-colors
          ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
          ${images.length === 0 ? "min-h-[150px]" : "min-h-[100px]"}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
            <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
            <p className="text-sm">Drag and drop images here</p>
            <p className="text-xs">or click Upload to browse</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {images.map((image, index) => (
              <div
                key={index}
                draggable
                onDragStart={(e) => handleImageDragStart(e, index)}
                onDragOver={(e) => handleImageDragOver(e, index)}
                onDragEnd={handleImageDragEnd}
                className={`
                  relative group aspect-square rounded-lg overflow-hidden border-2 cursor-move
                  ${draggedIndex === index ? "opacity-50" : ""}
                  ${dragOverIndex === index ? "border-primary" : "border-transparent"}
                `}
              >
                <img
                  src={image}
                  alt={`Gallery image ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f0f0f0' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='12'%3EError%3C/text%3E%3C/svg%3E";
                  }}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <div className="text-white">
                    <GripVertical className="w-5 h-5" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
                {index === 0 && (
                  <div className="absolute bottom-1 left-1 bg-primary text-white text-xs px-2 py-0.5 rounded">
                    Main
                  </div>
                )}
              </div>
            ))}
            {images.length < maxImages && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <Plus className="w-6 h-6" />
                <span className="text-xs mt-1">Add</span>
              </button>
            )}
          </div>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground">
        Drag images to reorder. First image will be the main display image.
      </p>
    </div>
  );
}
