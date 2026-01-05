
// @ts-nocheck
// Using @ts-nocheck because SpeechRecognition and related event types are not standard in all TS lib versions.
"use client";

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { Task, SortOrder } from '@/types/task';
import { Mic, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { LanguageStrings } from '@/lib/translations';
import { cn } from '@/lib/utils';
import { SortAndAgingIndicator } from './SortAndAgingIndicator';
import { AverageIndexGauge } from './AverageIndexGauge';
import { AgingLeaf } from './AgingLeaf';

interface TaskFormProps {
  onAddTask: (task: Omit<Task, 'id' | 'indice' | 'completado' | 'createdAt' | 'scheduledAt'> & { rawTarea: string; isFenix: boolean; fenixPeriod: number; }) => void;
  onAddSubTask: (subtask: { tarea: string, parentId: string }) => void;
  selectedTask?: Task | null;
  tasks: Task[];
  sortOrder: SortOrder;
  setSortOrder: (order: SortOrder) => void;
  averageIndex: number;
  leafColor: string;
  t: LanguageStrings;
  disabled?: boolean;
}

export function TaskForm({ onAddTask, onAddSubTask, selectedTask, tasks, sortOrder, setSortOrder, averageIndex, leafColor, t, disabled = false }: TaskFormProps) {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [hasMicPermission, setHasMicPermission] = React.useState<boolean | null>(null);
  const [textInputValue, setTextInputValue] = React.useState("");
  const [isFenix, setIsFenix] = React.useState(false);
  const [fenixPeriod, setFenixPeriod] = React.useState(30);
  
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
    if (selectedTask?.id) {
        if(selectedTask.completado) {
            toast({
                title: t.taskCompletedTitle,
                description: t.cannotAddSubtaskDescription,
                variant: "destructive",
            });
            return false;
        }
        onAddSubTask({ tarea: inputText, parentId: selectedTask.id });
        return true;
    }

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

      const isValidNumber = (num: number) => !isNaN(num) && num >= 1 && num <= 5;

      if ([urgencia, necesidad, costo, duracion].every(isValidNumber)) {
        onAddTask({ rawTarea, tarea: rawTarea, urgencia, necesidad, costo, duracion, isFenix, fenixPeriod });
        toast({
          title: t.taskAddedTitle,
          description: `"${rawTarea}" ${t.taskAddedDescription}`,
        });
        
        // Reset Fenix controls after adding a task
        setIsFenix(false);
        setFenixPeriod(30);

        return true; 
      } else {
         toast({
          title: t.invalidValuesErrorTitle,
          description: t.invalidValueDescription(1, 5),
          variant: "destructive",
          duration: 7000,
        });
      }
    } else {
      toast({
        title: t.formatNotRecognizedTitle,
        description: t.formatNotRecognizedDescription(inputText),
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
        title: t.unsupportedBrowserTitle,
        description: t.unsupportedBrowserDescription,
      });
      setHasMicPermission(false);
      return;
    }

    const recognitionInstance = new SpeechRecognitionAPI();
    recognitionInstance.continuous = true; 
    recognitionInstance.interimResults = false; 
    recognitionInstance.lang = t.speechLang;
    
    recognitionInstance.maxSpeechInputLength = 20000;
    if ('speechRecognitionTimeout' in recognitionInstance) { (recognitionInstance as any).speechRecognitionTimeout = 20000; }
    if ('endpointerTimeout' in recognitionInstance) { (recognitionInstance as any).endpointerTimeout = 10000; }
    if ('silenceTimeout' in recognitionInstance) { (recognitionInstance as any).silenceTimeout = 10000; }
    if ('longSilenceTimeout' in recognitionInstance) { (recognitionInstance as any).longSilenceTimeout = 10000; }

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
      let description = t.speechErrorGeneric;
      if (event.error === 'no-speech') { description = t.speechErrorNoSpeech; }
      else if (event.error === 'audio-capture') { description = t.speechErrorAudioCapture; }
      else if (event.error === 'not-allowed') { description = t.speechErrorNotAllowed; setHasMicPermission(false); }
      toast({ variant: 'destructive', title: t.speechErrorTitle, description });
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
            title: t.noSpeechDetectedTitle,
            description: t.noSpeechDetectedDescription,
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
  }, [hasMicPermission, toast, onAddTask, onAddSubTask, selectedTask, isFenix, fenixPeriod, t]);


  const handleMicClick = () => {
    if (disabled) return;
    if (hasMicPermission === false) {
      toast({
        variant: 'destructive',
        title: t.micUnavailableTitle,
        description: t.micUnavailableDescription,
      });
      return;
    }
    if (hasMicPermission === null) {
       toast({
        title: t.micPermissionPendingTitle,
        description: t.micPermissionPendingDescription,
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
           title: t.micStartErrorTitle,
           description: t.micStartErrorDescription,
         });
         setIsRecording(false); 
         setIsProcessing(false);
      }
    }
  };

  const handleTextInputSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (disabled) return;
    if (!textInputValue.trim()) {
        toast({
            title: t.emptyFieldTitle,
            description: t.emptyFieldDescription,
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

  const isSubtaskMode = !!selectedTask?.id;
  const isParentTaskCompleted = isSubtaskMode && selectedTask?.completado;

  let buttonContent;
  const statusText = disabled ? t.selectListToStart : (isSubtaskMode 
    ? t.subtaskDictationPrompt
    : t.taskDictationPrompt);

  if (isProcessing) {
    buttonContent = <Loader2 className="h-16 w-16 sm:h-20 sm:w-20 animate-spin" />; 
  } else if (isRecording) {
    buttonContent = <Mic className="h-16 w-16 sm:h-20 sm:w-20 text-destructive animate-pulse" />; 
  } else {
    if (hasMicPermission === null) {
      buttonContent = <Loader2 className="h-16 w-16 sm:h-20 sm:w-20 animate-spin" />;
    } else if (hasMicPermission === false) {
      buttonContent = <Mic className="h-16 w-16 sm:h-20 sm:w-20 text-muted-foreground" />;
    } else {
      buttonContent = <Mic className="h-16 w-16 sm:h-20 sm:w-20" />;
    }
  }
  
  const placeholderText = disabled ? t.selectListToStart : (isSubtaskMode
    ? isParentTaskCompleted
        ? t.taskCompletedPlaceholder
        : t.subtaskPlaceholder
    : t.taskPlaceholder);

  const buttonText = isSubtaskMode ? t.addSubtaskButton : t.addTaskButton;

  const gaugeSize = "128px"; 

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-3 bg-card p-4 sm:p-6 rounded-xl shadow-lg min-h-[280px] w-full", disabled && "opacity-60")}>
      {hasMicPermission === false && !isRecording && !isProcessing && (
         <Alert variant="destructive" className="w-full mb-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t.micAccessRequiredTitle}</AlertTitle>
            <AlertDescription>
              {t.micAccessRequiredDescription}
            </AlertDescription>
        </Alert>
      )}
      
      <p className="text-center text-muted-foreground px-2 py-1 flex items-center text-sm min-h-[2rem]">
        {statusText}
      </p>

      <div className="flex justify-center items-center w-full">
        <div style={{ width: gaugeSize }} className="hidden sm:flex justify-center items-center">
            <AgingLeaf color={leafColor} className="w-60 h-60"/>
        </div>
        
        <div className="flex-shrink-0">
          <Button
            onClick={handleMicClick}
            disabled={disabled || isProcessing || hasMicPermission === null || (hasMicPermission === false && !isRecording) || isParentTaskCompleted} 
            className="h-36 w-36 sm:h-40 sm:w-40 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-xl flex items-center justify-center transition-all duration-150 ease-in-out hover:scale-105 active:scale-95"
            aria-label={isRecording ? t.stopRecordingAriaLabel : t.startRecordingAriaLabel}
          >
            {buttonContent}
          </Button>
        </div>

        <div style={{ width: gaugeSize }} className="hidden sm:flex justify-start items-center pl-4">
            <AverageIndexGauge value={averageIndex} maxValue={11} />
        </div>
      </div>
      
      <form onSubmit={handleTextInputSubmit} className="w-full space-y-3 px-1 pt-2 max-w-xl mx-auto">
        <Input 
          type="text"
          placeholder={placeholderText}
          value={textInputValue}
          onChange={(e) => setTextInputValue(e.target.value)}
          disabled={disabled || isRecording || isProcessing || hasMicPermission === null || isParentTaskCompleted}
          aria-label={t.manualInputAriaLabel}
          className="text-base text-center"
        />
        <Button 
          type="submit" 
          className="w-full" 
          disabled={disabled || isRecording || isProcessing || !textInputValue.trim() || hasMicPermission === null || isParentTaskCompleted}
        >
          {buttonText}
        </Button>
      </form>

      <div className={cn("w-full pt-3 max-w-xl mx-auto", isSubtaskMode && "invisible")}>
         <div className="w-full flex items-center justify-center space-x-2 px-1">
            <div className={cn("w-1/2 flex items-center justify-center space-x-4 pr-2", isSubtaskMode && "invisible")}>
                <div className="flex items-center space-x-2">
                    <Checkbox id="fenix-checkbox" checked={isFenix} onCheckedChange={setIsFenix} disabled={disabled || isSubtaskMode} />
                    <Label htmlFor="fenix-checkbox" className="text-sm font-medium">{t.fenix}</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Input
                        id="fenix-period"
                        type="number"
                        value={fenixPeriod}
                        onChange={(e) => setFenixPeriod(Number(e.target.value))}
                        className="w-16 h-8 text-center"
                        min="1"
                        disabled={disabled || !isFenix || isSubtaskMode}
                    />
                    <Label htmlFor="fenix-period" className="text-sm text-muted-foreground">{t.days}</Label>
                </div>
            </div>
            <div className="w-1/2 flex items-center justify-center pl-2">
                <SortAndAgingIndicator 
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                    t={t}
                    disabled={disabled}
                />
            </div>
        </div>
      </div>
    </div>
  );
}
