"use client";

import * as React from 'react';
import type { Task } from '@/types/task';
import { TaskForm } from '@/components/TaskForm';
import { TaskList } from '@/components/TaskList';
import { useToast } from "@/hooks/use-toast";

export default function HomePage() {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    const storedTasksRaw = localStorage.getItem('task-ranker-tasks');
    if (storedTasksRaw) {
      try {
        const storedTasks = JSON.parse(storedTasksRaw);
        setTasks(storedTasks.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt) // Ensure Date object is restored
        })));
      } catch (e) {
        console.error("Failed to parse tasks from localStorage", e);
        toast({
          title: "Error al cargar tareas",
          description: "No se pudieron cargar las tareas guardadas. Se iniciará con una lista vacía.",
          variant: "destructive",
        });
        localStorage.removeItem('task-ranker-tasks'); // Clear corrupted data
      }
    }
    setIsLoading(false);
  }, [toast]);

  React.useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('task-ranker-tasks', JSON.stringify(tasks));
    }
  }, [tasks, isLoading]);

  const handleAddTask = (taskData: Omit<Task, 'id' | 'indice' | 'completado' | 'createdAt'> & { rawTarea: string }) => {
    const num = taskData.urgencia + taskData.necesidad;
    const den = taskData.costo + taskData.duracion;
    let indice;

    if (den === 0) {
      if (num > 0) {
        indice = Infinity;
      } else {
        indice = 0; // Or handle as an error/special case like NaN then normalize
      }
    } else {
      indice = num / den;
    }

    // Normalize NaN to 0, though previous logic should prevent it with valid numbers
    if (isNaN(indice)) {
      indice = 0;
    }
    
    const newTask: Task = {
      id: crypto.randomUUID(),
      tarea: taskData.rawTarea,
      urgencia: taskData.urgencia,
      necesidad: taskData.necesidad,
      costo: taskData.costo,
      duracion: taskData.duracion,
      indice: indice,
      completado: false,
      createdAt: new Date(),
    };
    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  const handleToggleComplete = (id: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, completado: !task.completado } : task
      )
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
    toast({
      title: "Tarea eliminada",
      description: "La tarea ha sido eliminada de la lista.",
    });
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 min-h-screen flex flex-col">
      <header className="mb-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-primary tracking-tight">
          Task Ranker
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Organiza y prioriza tus tareas pendientes de forma inteligente.
        </p>
      </header>

      <main className="flex-grow">
        <section className="mb-10">
          <TaskForm onAddTask={handleAddTask} />
        </section>

        <section>
          <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-foreground border-b pb-2">
            Lista de Tareas
          </h2>
          {isLoading ? (
            <p className="text-center text-muted-foreground">Cargando tareas...</p>
          ) : (
            <TaskList
              tasks={tasks}
              onToggleComplete={handleToggleComplete}
              onDeleteTask={handleDeleteTask}
            />
          )}
        </section>
      </main>
      
      <footer className="text-center py-6 mt-10 border-t">
        <p className="text-sm text-muted-foreground">
          Task Ranker &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
