"use client";

import type * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import type { Task } from '@/types/task';

const taskFormSchema = z.object({
  taskInput: z.string()
    .min(1, "La entrada de la tarea no puede estar vacía.")
    .regex(/^(.+?)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)$/, "Formato inválido. Esperado: descripción urgencia necesidad costo duración (ej: limpiar la pecera 5 2 1 2)"),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  onAddTask: (task: Omit<Task, 'id' | 'indice' | 'completado' | 'createdAt'> & { rawTarea: string }) => void;
}

export function TaskForm({ onAddTask }: TaskFormProps) {
  const { toast } = useToast();
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      taskInput: '',
    },
  });

  function onSubmit(data: TaskFormValues) {
    const match = data.taskInput.match(/^(.+?)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)$/);
    if (match) {
      const rawTarea = match[1].trim();
      const urgencia = parseInt(match[2], 10);
      const necesidad = parseInt(match[3], 10);
      const costo = parseInt(match[4], 10);
      const duracion = parseInt(match[5], 10);

      if ([urgencia, necesidad, costo, duracion].some(isNaN)) {
        toast({
          title: "Error de formato",
          description: "Los valores numéricos no son válidos.",
          variant: "destructive",
        });
        return;
      }
      
      onAddTask({ rawTarea, tarea: rawTarea, urgencia, necesidad, costo, duracion });
      form.reset();
      toast({
        title: "Tarea añadida",
        description: `"${rawTarea}" ha sido añadida a la lista.`,
      });
    } else {
      // This case should ideally be caught by Zod, but as a fallback:
      toast({
        title: "Error de formato",
        description: "Por favor, introduce la tarea en el formato correcto.",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 rounded-lg shadow-md">
        <FormField
          control={form.control}
          name="taskInput"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="taskInput" className="text-lg font-semibold">Añadir Nueva Tarea</FormLabel>
              <FormControl>
                <Input 
                  id="taskInput" 
                  placeholder="Ej: Limpiar la pecera 5 2 1 2 (descripción urgencia necesidad costo duración)" 
                  {...field}
                  className="text-base"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
          Añadir Tarea
        </Button>
      </form>
    </Form>
  );
}
