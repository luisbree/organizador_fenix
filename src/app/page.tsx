
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
    let loadedTasks: Task[] = [];
    if (storedTasksRaw) {
      try {
        const storedTasks = JSON.parse(storedTasksRaw);
        loadedTasks = storedTasks.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt) // Ensure Date object is restored
        }));
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

    if (loadedTasks.length === 0) {
      // Add a default task if no tasks are loaded
      const exampleTask: Task = {
        id: crypto.randomUUID(),
        tarea: "Pasear al perro",
        urgencia: 4,
        necesidad: 5,
        costo: 1,
        duracion: 2,
        indice: (4 + 5) / (1 + 2), // (U+N)/(C+D) = 9/3 = 3
        completado: false,
        createdAt: new Date(),
      };
      setTasks([exampleTask]);
    } else {
      setTasks(loadedTasks);
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
        indice = 0; 
      }
    } else {
      indice = num / den;
    }

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
      <header className="my-6 md:my-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight">
          Task Ranker
        </h1>
      </header>

      <main className="flex-grow flex flex-col space-y-8">
        <section>
          <TaskForm onAddTask={handleAddTask} />
        </section>

        <section className="flex-grow flex flex-col">
          <h2 className="text-2xl font-semibold mb-4 text-foreground border-b pb-2">
            Lista de Tareas
          </h2>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-4">Cargando tareas...</p>
          ) : (
            <div className="flex-grow">
              <TaskList
                tasks={tasks}
                onToggleComplete={handleToggleComplete}
                onDeleteTask={handleDeleteTask}
              />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
