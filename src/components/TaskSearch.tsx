
// @ts-nocheck
// Using @ts-nocheck because SpeechRecognition and related event types are not standard in all TS lib versions.
"use client";

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mic, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { LanguageStrings } from '@/lib/translations';

interface TaskSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  t: LanguageStrings;
}

export function TaskSearch({ searchQuery, setSearchQuery, t }: TaskSearchProps) {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = React.useState(false);
  const [hasMicPermission, setHasMicPermission] = React.useState<boolean | null>(null);
  const recognitionRef = React.useRef<SpeechRecognition | null>(null);

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
    if (typeof window !== 'undefined' && 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      requestMicPermission();
    } else {
        setHasMicPermission(false);
    }
  }, []);

  React.useEffect(() => {
    if (hasMicPermission !== true) return;

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setHasMicPermission(false);
      return;
    }

    const recognitionInstance = new SpeechRecognitionAPI();
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;
    recognitionInstance.lang = t.speechLang;

    recognitionInstance.onstart = () => {
      setIsRecording(true);
    };

    recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
    };

    recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error', event.error);
      let description = t.speechErrorGeneric;
      if (event.error === 'no-speech') description = t.speechErrorNoSpeech;
      else if (event.error === 'not-allowed') description = t.speechErrorNotAllowed;
      toast({ variant: 'destructive', title: t.speechErrorTitle, description });
    };

    recognitionInstance.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognitionInstance;

    return () => {
      recognitionRef.current?.abort();
    };
  }, [hasMicPermission, setSearchQuery, toast, t]);

  const handleMicClick = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else if (recognitionRef.current) {
        try {
            recognitionRef.current.start();
        } catch (e) {
            console.error("Error starting recognition:", e);
        }
    } else {
        toast({
            variant: 'destructive',
            title: t.micUnavailableTitle,
            description: t.micUnsupportedDescription,
        });
    }
  };
  
  const showClearButton = searchQuery.length > 0;

  return (
    <div className="relative w-full">
      <Input
        type="text"
        placeholder={t.searchPlaceholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className={cn("w-full pr-20 text-base", showClearButton ? "pr-20" : "pr-10")}
        aria-label={t.searchAriaLabel}
        style={{backgroundColor: '#fdfdfd'}}
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-2">
        {showClearButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchQuery('')}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            aria-label={t.clearSearchAriaLabel}
          >
            <X className="h-5 w-5" />
          </Button>
        )}
        <Button
            variant="ghost"
            size="icon"
            onClick={handleMicClick}
            disabled={hasMicPermission === null || hasMicPermission === false}
            className="h-8 w-8"
            aria-label={isRecording ? t.stopRecordingAriaLabel : t.searchByVoiceAriaLabel}
        >
            {hasMicPermission === null ? (
                <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
                <Mic className={cn("h-5 w-5", isRecording && "text-destructive animate-pulse")} />
            )}
        </Button>
      </div>
    </div>
  );
}
