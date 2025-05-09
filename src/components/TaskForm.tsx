// @ts-nocheck
// Using @ts-nocheck because SpeechRecognition and related event types are not standard in all TS lib versions.
"use client";

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Task } from '@/types/task';
import { Mic, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface TaskFormProps {
  onAddTask: (task: Omit<Task, 'id' | 'indice' | 'completado' | 'createdAt'> & { rawTarea: string }) => void;
}

export function TaskForm({ onAddTask }: TaskFormProps) {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [hasMicPermission, setHasMicPermission] = React.useState<boolean | null>(null);
  
  const recognitionRef = React.useRef<SpeechRecognition | null>(null);
  const lastTranscriptRef = React.useRef<string>("");
  const errorFlagRef = React.useRef<boolean>(false);


  React.useEffect(() => {
    const requestMicPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Stop tracks as we only need permission
        setHasMicPermission(true);
      } catch (error) {
        console.error('Error accessing microphone:', error);
        setHasMicPermission(false);
        toast({
          variant: 'destructive',
          title: 'Acceso al micrófono denegado',
          description: 'Por favor, habilita el acceso al micrófono en la configuración de tu navegador.',
        });
      }
    };
    requestMicPermission();
  }, [toast]);

  React.useEffect(() => {
    if (hasMicPermission !== true) return;

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      toast({
        variant: 'destructive',
        title: 'Navegador no compatible',
        description: 'Tu navegador no soporta el reconocimiento de voz.',
      });
      setHasMicPermission(false); // Disable if not supported
      return;
    }

    const recognitionInstance = new SpeechRecognitionAPI();
    recognitionInstance.continuous = false; // Stop on first pause
    recognitionInstance.interimResults = false; // Only final results
    recognitionInstance.lang = 'es-ES';

    recognitionInstance.onstart = () => {
      setIsRecording(true);
      setIsProcessing(false);
      errorFlagRef.current = false;
    };

    recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
      lastTranscriptRef.current = event.results[event.results.length - 1][0].transcript.trim();
    };

    recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error', event.error);
      errorFlagRef.current = true;
      let description = 'Ocurrió un error durante el reconocimiento de voz.';
      if (event.error === 'no-speech') {
        description = 'No se detectó voz. Inténtalo de nuevo.';
      } else if (event.error === 'audio-capture') {
        description = 'Problema con la captura de audio. Asegúrate que el micrófono funciona.';
      } else if (event.error === 'not-allowed') {
        description = 'Acceso al micrófono denegado. Habilítalo en la configuración.';
        setHasMicPermission(false); // Update permission state
      }
      toast({ variant: 'destructive', title: 'Error de Reconocimiento', description });
      setIsRecording(false);
      setIsProcessing(false);
    };

    recognitionInstance.onend = () => {
      const wasActuallyRecording = isRecording; // Capture state before setIsRecording(false)
      setIsRecording(false);
      
      if (errorFlagRef.current) {
        setIsProcessing(false);
        lastTranscriptRef.current = ""; // Clear any partial/error transcript
        return;
      }

      if (lastTranscriptRef.current) {
        setIsProcessing(true);
        processTranscript(lastTranscriptRef.current);
        lastTranscriptRef.current = "";
      } else if (wasActuallyRecording) {
        // This case implies recording stopped, no error, but no transcript (e.g. silence timeout)
        toast({
            title: "No se detectó voz",
            description: "No se escuchó nada. Inténtalo de nuevo.",
            variant: "default", 
        });
        setIsProcessing(false);
      } else {
        setIsProcessing(false); // General fallback
      }
    };
    
    recognitionRef.current = recognitionInstance;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort(); // Use abort to stop any ongoing recognition
      }
    };
  }, [hasMicPermission, toast]); // isRecording removed from deps as onend handles it

  const processTranscript = (transcript: string) => {
    const match = transcript.match(/^(.+?)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)$/);
    if (match) {
      const rawTarea = match[1].trim();
      const urgencia = parseInt(match[2], 10);
      const necesidad = parseInt(match[3], 10);
      const costo = parseInt(match[4], 10);
      const duracion = parseInt(match[5], 10);

      const isValidNumber = (num: number) => !isNaN(num) && num >= 0 && num <= 10;

      if ([urgencia, necesidad, costo, duracion].every(isValidNumber)) {
        onAddTask({ rawTarea, tarea: rawTarea, urgencia, necesidad, costo, duracion });
        toast({
          title: "Tarea añadida por voz",
          description: `"${rawTarea}" ha sido añadida a la lista.`,
        });
      } else {
         toast({
          title: "Error en los valores",
          description: "Los valores numéricos (urgencia, necesidad, costo, duración) deben ser números entre 0 y 10.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Formato de voz no reconocido",
        description: `No se pudo entender: "${transcript}". Asegúrate de decir: descripción de la tarea, seguido de los cuatro números (urgencia, necesidad, costo, duración). Por ejemplo: "limpiar la pecera 5 2 1 2".`,
        variant: "destructive",
        duration: 7000, // Longer duration for detailed message
      });
    }
    setIsProcessing(false);
  };

  const handleMicClick = () => {
    if (hasMicPermission === false) {
      toast({
        variant: 'destructive',
        title: 'Micrófono no disponible',
        description: 'Por favor, otorga permisos para el micrófono o actualiza la página si ya los diste.',
      });
      // Optionally try to request permission again, or guide user.
      // For now, just shows toast. User might need to refresh or change browser settings.
      return;
    }
    if (hasMicPermission === null) {
       toast({
        title: 'Permiso de Micrófono Pendiente',
        description: 'Esperando confirmación del permiso para usar el micrófono.',
      });
      return;
    }


    if (isRecording) {
      recognitionRef.current?.stop();
    } else if (!isProcessing && recognitionRef.current) {
      lastTranscriptRef.current = "";
      errorFlagRef.current = false;
      try {
        recognitionRef.current.start();
      } catch (e) {
         console.error("Error starting recognition:", e);
         toast({
           variant: 'destructive',
           title: 'Error al iniciar grabación',
           description: 'No se pudo iniciar el reconocimiento de voz. Intenta de nuevo.',
         });
         setIsRecording(false);
         setIsProcessing(false);
      }
    }
  };

  let buttonContent;
  let statusText = "Presiona el micrófono para añadir una tarea por voz.";

  if (isProcessing) {
    buttonContent = <Loader2 className="h-10 w-10 animate-spin" />;
    statusText = "Procesando tarea...";
  } else if (isRecording) {
    buttonContent = <Mic className="h-10 w-10 text-destructive animate-pulse" />;
    statusText = "Escuchando... Di tu tarea y los parámetros.";
  } else {
    buttonContent = <Mic className="h-10 w-10" />;
  }
  
  if(hasMicPermission === null) {
    statusText = "Solicitando permiso para el micrófono...";
    buttonContent = <Loader2 className="h-10 w-10 animate-spin" />;
  } else if (hasMicPermission === false) {
     statusText = "El acceso al micrófono está denegado o no disponible.";
     buttonContent = <Mic className="h-10 w-10 text-muted-foreground" />;
  }


  return (
    <div className="flex flex-col items-center justify-center space-y-6 bg-card p-8 rounded-lg shadow-md min-h-[200px]">
      {hasMicPermission === false && (
         <Alert variant="destructive" className="w-full max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Acceso al Micrófono Requerido</AlertTitle>
            <AlertDescription>
              Para usar el ingreso por voz, por favor habilita el acceso al micrófono en la configuración de tu navegador y actualiza la página.
            </AlertDescription>
        </Alert>
      )}
      
      <Button
        onClick={handleMicClick}
        disabled={isProcessing || hasMicPermission === null || (hasMicPermission === false && !isRecording)} // Disable if processing, permission pending, or denied (unless it was already recording and got denied mid-way)
        className="h-24 w-24 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg flex items-center justify-center"
        aria-label={isRecording ? "Detener grabación" : "Iniciar grabación de tarea"}
      >
        {buttonContent}
      </Button>
      <p className="text-center text-muted-foreground px-4">{statusText}</p>
       <p className="text-xs text-center text-muted-foreground px-4 pt-2">
        Ejemplo: "Comprar leche 8 7 2 1" (Tarea Urgencia Necesidad Costo Duración)
      </p>
    </div>
  );
}
