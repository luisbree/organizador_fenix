
// @ts-nocheck
// Using @ts-nocheck because SpeechRecognition and related event types are not standard in all TS lib versions.
"use client";

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { Task } from '@/types/task';
import { Mic, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface TaskFormProps {
  onAddTask: (task: Omit<Task, 'id' | 'indice' | 'completado' | 'createdAt' | 'isSchedulingAttempted'> & { rawTarea: string }) => void;
}

export function TaskForm({ onAddTask }: TaskFormProps) {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false); // Used for both voice and text processing
  const [hasMicPermission, setHasMicPermission] = React.useState<boolean | null>(null);
  const [textInputValue, setTextInputValue] = React.useState("");
  
  const recognitionRef = React.useRef<SpeechRecognition | null>(null);
  const lastTranscriptRef = React.useRef<string>("");
  const errorFlagRef = React.useRef<boolean>(false);

  React.useEffect(() => {
    const requestMicPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); 
        setHasMicPermission(true);
      } catch (error) {
        console.error('Error accessing microphone:', error);
        setHasMicPermission(false);
      }
    };
    requestMicPermission();
  }, []);

  const parseAndAddTask = (inputText: string): boolean => {
    let match = inputText.match(/^(.+?)\s+(\d)\s+(\d)\s+(\d)\s+(\d)$/);

    if (!match) {
      const fourNumbersMatch = inputText.match(/^(.+?)\s+(\d{4})$/);
      if (fourNumbersMatch) {
        const taskDesc = fourNumbersMatch[1];
        const numbersStr = fourNumbersMatch[2];
        match = [
          fourNumbersMatch[0], 
          taskDesc,            
          numbersStr[0],       
          numbersStr[1],       
          numbersStr[2],       
          numbersStr[3]        
        ];
      }
    }

    if (match) {
      const rawTarea = match[1].trim();
      const urgencia = parseInt(match[2], 10);
      const necesidad = parseInt(match[3], 10);
      const costo = parseInt(match[4], 10);
      const duracion = parseInt(match[5], 10);

      const isValidNumber = (num: number) => !isNaN(num) && num >= 0 && num <= 5;

      if ([urgencia, necesidad, costo, duracion].every(isValidNumber)) {
        onAddTask({ rawTarea, tarea: rawTarea, urgencia, necesidad, costo, duracion });
        toast({
          title: "Tarea añadida",
          description: `"${rawTarea}" ha sido añadida a la lista.`,
        });
        return true; 
      } else {
         toast({
          title: "Error en los valores",
          description: "Los valores numéricos (urgencia, necesidad, costo, duración) deben ser números entre 0 y 5. El formato detectado no es válido.",
          variant: "destructive",
          duration: 7000,
        });
      }
    } else {
      toast({
        title: "Formato no reconocido",
        description: `No se pudo entender: "${inputText}". Asegúrate de usar el formato: descripción, seguido de los cuatro números (0-5) separados o juntos. Por ejemplo: "limpiar la pecera 5 2 1 2" o "limpiar la pecera 5212".`,
        variant: "destructive",
        duration: 10000, 
      });
    }
    return false;
  };

  React.useEffect(() => {
    if (hasMicPermission !== true) return;

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      toast({
        variant: 'destructive',
        title: 'Navegador no compatible',
        description: 'Tu navegador no soporta el reconocimiento de voz.',
      });
      setHasMicPermission(false);
      return;
    }

    const recognitionInstance = new SpeechRecognitionAPI();
    recognitionInstance.continuous = true; 
    recognitionInstance.interimResults = false; 
    recognitionInstance.lang = 'es-ES';
    
    // Extended timeouts for speech recognition
    recognitionInstance.maxSpeechInputLength = 20000; // Extend the maximum length of speech input if supported (non-standard)
    if ('speechRecognitionTimeout' in recognitionInstance) { (recognitionInstance as any).speechRecognitionTimeout = 20000; } // W3C Speech API draft
    if ('endpointerTimeout' in recognitionInstance) { (recognitionInstance as any).endpointerTimeout = 10000; } // Specific to some implementations
    if ('silenceTimeout' in recognitionInstance) { (recognitionInstance as any).silenceTimeout = 10000; } // Web Speech API by Google
    if ('longSilenceTimeout' in recognitionInstance) { (recognitionInstance as any).longSilenceTimeout = 10000; } // Experimental property

    recognitionInstance.onstart = () => {
      setIsRecording(true);
      setIsProcessing(false); 
      errorFlagRef.current = false;
    };

    recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
      let fullTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        fullTranscript += event.results[i][0].transcript.trim() + " ";
      }
      lastTranscriptRef.current = fullTranscript.trim();
    };

    recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error', event.error);
      errorFlagRef.current = true;
      let description = 'Ocurrió un error durante el reconocimiento de voz.';
      if (event.error === 'no-speech') { description = 'No se detectó voz. Inténtalo de nuevo.'; }
      else if (event.error === 'audio-capture') { description = 'Problema con la captura de audio. Asegúrate que el micrófono funciona.'; }
      else if (event.error === 'not-allowed') { description = 'Acceso al micrófono denegado. Habilítalo en la configuración.'; setHasMicPermission(false); }
      toast({ variant: 'destructive', title: 'Error de Reconocimiento', description });
      setIsRecording(false);
      setIsProcessing(false);
    };

    recognitionInstance.onend = () => {
      const wasActuallyRecording = isRecording; 
      setIsRecording(false); 
      
      if (errorFlagRef.current) {
        setIsProcessing(false);
        lastTranscriptRef.current = ""; 
        return;
      }

      if (lastTranscriptRef.current) {
        setIsProcessing(true); 
        const recognizedText = lastTranscriptRef.current;
        setTextInputValue(recognizedText); 

        const success = parseAndAddTask(recognizedText); 
        if (success) {
          setTextInputValue(""); 
        }
        
        lastTranscriptRef.current = ""; 
        setIsProcessing(false); 
      } else if (wasActuallyRecording) { 
        toast({
            title: "No se detectó voz",
            description: "No se escuchó nada. Inténtalo de nuevo.",
            variant: "default", 
        });
        setIsProcessing(false);
      } else {
        setIsProcessing(false); 
      }
    };
    
    recognitionRef.current = recognitionInstance;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort(); 
      }
    };
  }, [hasMicPermission, toast, onAddTask]);


  const handleMicClick = () => {
    if (hasMicPermission === false) {
      toast({
        variant: 'destructive',
        title: 'Micrófono no disponible',
        description: 'Por favor, otorga permisos para el micrófono o actualiza la página si ya los diste.',
      });
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
      setTextInputValue(""); 
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

  const handleTextInputSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!textInputValue.trim()) {
        toast({
            title: "Campo vacío",
            description: "Por favor, escribe la tarea y sus valores.",
            variant: "destructive",
        });
        return;
    }
    setIsProcessing(true);
    const success = parseAndAddTask(textInputValue);
    if (success) {
        setTextInputValue(""); 
    }
    setIsProcessing(false);
  };


  let buttonContent;
  let statusText;

  if (isProcessing) {
    buttonContent = <Loader2 className="h-[70%] w-[70%] sm:h-[75%] sm:w-[75%] animate-spin" />; 
    statusText = "Procesando tarea...";
  } else if (isRecording) {
    buttonContent = <Mic className="h-[70%] w-[70%] sm:h-[75%] sm:w-[75%] text-destructive animate-pulse" />; 
    statusText = "Escuchando... Presiona de nuevo para finalizar.";
  } else {
    if (hasMicPermission === null) {
      statusText = "Solicitando permiso para el micrófono...";
      buttonContent = <Loader2 className="h-[70%] w-[70%] sm:h-[75%] sm:w-[75%] animate-spin" />;
    } else if (hasMicPermission === false) {
      statusText = "Micrófono no disponible. Puedes usar el campo de texto.";
      buttonContent = <Mic className="h-[70%] w-[70%] sm:h-[75%] sm:w-[75%] text-muted-foreground" />;
    } else {
      statusText = "Presiona el micrófono o escribe abajo para añadir una tarea.";
      buttonContent = <Mic className="h-[70%] w-[70%] sm:h-[75%] sm:w-[75%]" />;
    }
  }
  
  return (
    <div className="flex flex-col items-center justify-center space-y-3 bg-card p-4 sm:p-6 rounded-xl shadow-lg min-h-[280px] w-full">
      {hasMicPermission === false && !isRecording && !isProcessing && (
         <Alert variant="destructive" className="w-full mb-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Acceso al Micrófono Requerido</AlertTitle>
            <AlertDescription>
              Para usar el ingreso por voz, habilita el acceso al micrófono en la configuración de tu navegador y actualiza la página. Aún puedes ingresar tareas por texto.
            </AlertDescription>
        </Alert>
      )}
      
      <p className="text-center text-muted-foreground px-2 py-1 flex items-center text-sm min-h-[2rem]">
        {statusText}
      </p>

      <Button
        onClick={handleMicClick}
        disabled={isProcessing || hasMicPermission === null || (hasMicPermission === false && !isRecording)} 
        className="h-36 w-36 sm:h-40 sm:w-40 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-xl flex items-center justify-center transition-all duration-150 ease-in-out hover:scale-105 active:scale-95"
        aria-label={isRecording ? "Detener grabación" : "Iniciar grabación de tarea"}
      >
        {buttonContent}
      </Button>
      
      <form onSubmit={handleTextInputSubmit} className="w-full space-y-3 px-1 pt-2 max-w-xl mx-auto"> {/* Limita el ancho del formulario interno */}
        <Input 
          type="text"
          placeholder="Ej: Comprar leche 5 4 1 2"
          value={textInputValue}
          onChange={(e) => setTextInputValue(e.target.value)}
          disabled={isRecording || isProcessing || hasMicPermission === null}
          aria-label="Ingresar tarea manualmente con descripción y cuatro números"
          className="text-base text-center"
        />
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isRecording || isProcessing || !textInputValue.trim() || hasMicPermission === null}
        >
          Añadir Tarea con Texto
        </Button>
      </form>

       <p className="text-xs text-center text-muted-foreground px-4 pt-3 max-w-md">
        <strong>Formato:</strong> "Descripción U N C D" (0-5).
        <br/>Ej: "Pasear al perro 5312" o "Pasear al perro 5 3 1 2".
      </p>
    </div>
  );
}
