"use client";

import { useState, useCallback, useRef, type DragEvent } from "react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { generatePhotoDescription } from "@/ai/flows/generate-photo-description";
import { regeneratePhotoDescription } from "@/ai/flows/regenerate-photo-description";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UploadCloud, Copy, RefreshCw, Wand2, X } from "lucide-react";
import { cn } from "@/lib/utils";

type State = {
  photoDataUri: string | null;
  description: string | null;
  isLoading: boolean;
  error: string | null;
  isDragging: boolean;
};

export default function PhotoNarrator() {
  const [state, setState] = useState<State>({
    photoDataUri: null,
    description: null,
    isLoading: false,
    error: null,
    isDragging: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const resetState = () => {
    setState({
      photoDataUri: null,
      description: null,
      isLoading: false,
      error: null,
      isDragging: false,
    });
  };
  
  const handleFile = useCallback(
    async (file: File) => {
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please upload an image file (e.g., PNG, JPG, GIF).",
        });
        return;
      }
      
      setState((s) => ({ ...s, isLoading: true, description: null, error: null }));
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUri = e.target?.result as string;
        setState((s) => ({ ...s, photoDataUri: dataUri, isDragging: false }));
        
        try {
          const result = await generatePhotoDescription({ photoDataUri: dataUri });
          setState((s) => ({ ...s, description: result.description, isLoading: false }));
        } catch (err) {
          console.error(err);
          setState((s) => ({ ...s, error: "Failed to generate description.", isLoading: false }));
          toast({
            variant: "destructive",
            title: "Generation Error",
            description: "Could not generate a description for the photo. Please try again.",
          });
        }
      };
      reader.readAsDataURL(file);
    },
    [toast]
  );

  const handleRegenerate = useCallback(async () => {
    if (!state.photoDataUri) return;

    setState((s) => ({ ...s, isLoading: true, description: null, error: null }));
    try {
      const result = await regeneratePhotoDescription({ photoDataUri: state.photoDataUri });
      setState((s) => ({ ...s, description: result.description, isLoading: false }));
      toast({ title: "Success", description: "A new description has been generated." });
    } catch (err) {
      console.error(err);
      setState((s) => ({ ...s, error: "Failed to regenerate description.", isLoading: false }));
      toast({
        variant: "destructive",
        title: "Regeneration Error",
        description: "Could not regenerate a description. Please try again.",
      });
    }
  }, [state.photoDataUri, toast]);

  const handleCopy = () => {
    if (!state.description) return;
    navigator.clipboard.writeText(state.description);
    toast({
      title: "Copied to clipboard!",
      description: "The description is now ready to be pasted.",
    });
  };

  const onDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setState(s => ({...s, isDragging: true }));
  };
  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setState(s => ({...s, isDragging: false }));
  };
  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setState(s => ({...s, isDragging: false }));
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  if (!state.photoDataUri) {
    return (
      <Card 
        className={cn(
          "max-w-2xl mx-auto border-2 border-dashed rounded-xl transition-colors duration-300",
          state.isDragging ? 'border-primary bg-primary/10' : 'border-muted'
        )}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <CardContent className="p-8 text-center flex flex-col items-center justify-center space-y-4 min-h-[300px]">
          <UploadCloud className="w-16 h-16 text-muted-foreground" />
          <p className="text-muted-foreground font-body">
            Drag & drop your photo here, or{" "}
            <span
              className="text-primary font-semibold cursor-pointer hover:underline"
              onClick={() => fileInputRef.current?.click()}
            >
              browse to upload
            </span>
            .
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && handleFile(e.target.files[0])}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="overflow-hidden shadow-lg relative">
        <Image
          src={state.photoDataUri}
          alt="Uploaded photo"
          width={1024}
          height={768}
          className="w-full h-auto object-contain"
          data-ai-hint="user uploaded content"
        />
        <Button variant="destructive" size="icon" className="absolute top-4 right-4 rounded-full" onClick={resetState}>
          <X className="h-4 w-4"/>
          <span className="sr-only">Upload another photo</span>
        </Button>
      </Card>

      {state.isLoading && (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </CardContent>
          <CardFooter className="gap-2">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-32" />
          </CardFooter>
        </Card>
      )}

      {state.description && !state.isLoading && (
        <Card className="shadow-lg animate-in fade-in duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Wand2 />
              Generated Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/90 font-body text-base md:text-lg leading-relaxed">{state.description}</p>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCopy}>
              <Copy />
              Copy Text
            </Button>
            <Button onClick={handleRegenerate} disabled={state.isLoading}>
              <RefreshCw className={cn(state.isLoading && "animate-spin")} />
              Regenerate
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
