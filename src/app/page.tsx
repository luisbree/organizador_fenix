
"use client";

import * as React from 'react';
import type { Task } from '@/types/task';
import { TaskForm } from '@/components/TaskForm';
import { TaskList } from '@/components/TaskList';
import { useToast } from "@/hooks/use-toast";
import { useAuth, useCollection, useFirestore, useUser } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { useMemoFirebase } from '@/firebase/provider';
import { Loader2 } from 'lucide-react';

const SHARED_USER_ID = "shared_user";

export default function HomePage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [isUserLoading, user, auth]);

  const tasksQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users', SHARED_USER_ID, 'tasks');
  }, [firestore]);

  const { data: tasks, isLoading: isLoadingTasks } = useCollection<Task>(tasksQuery);

  const handleAddTask = (taskData: Omit<Task, 'id' | 'indice' | 'completado' | 'createdAt' | 'isSchedulingAttempted'> & { rawTarea: string }) => {
    if (!tasksQuery) return;
    
    const num = taskData.urgencia + taskData.necesidad;
    const den = taskData.costo + taskData.duracion;
    let indice;

    if (den === 0) {
      indice = num > 0 ? Infinity : 0;
    } else {
      indice = num / den;
    }

    if (isNaN(indice)) {
      indice = 0;
    }
    
    const capitalizedTarea = taskData.rawTarea.charAt(0).toUpperCase() + taskData.rawTarea.slice(1);

    const newTask: Omit<Task, 'id' | 'createdAt'> = {
      tarea: capitalizedTarea,
      urgencia: taskData.urgencia,
      necesidad: taskData.necesidad,
      costo: taskData.costo,
      duracion: taskData.duracion,
      indice: indice,
      completado: false,
      isSchedulingAttempted: false,
    };
    
    addDocumentNonBlocking(tasksQuery, {
      ...newTask,
      createdAt: serverTimestamp(),
    });
  };

  const handleToggleComplete = (id: string) => {
    if (!firestore) return;
    const taskRef = doc(firestore, 'users', SHARED_USER_ID, 'tasks', id);
    const task = tasks?.find(t => t.id === id);
    if(task) {
      updateDocumentNonBlocking(taskRef, { completado: !task.completado });
    }
  };

  const handleDeleteTask = (id: string) => {
    if (!firestore) return;
    const taskRef = doc(firestore, 'users', SHARED_USER_ID, 'tasks', id);
    deleteDocumentNonBlocking(taskRef);
    toast({
      title: "Tarea eliminada",
      description: "La tarea ha sido eliminada de la lista.",
    });
  };

  const handleMarkSchedulingAttempted = (id: string) => {
    if (!firestore) return;
    const taskRef = doc(firestore, 'users', SHARED_USER_ID, 'tasks', id);
    updateDocumentNonBlocking(taskRef, { isSchedulingAttempted: true });
  };

  const handleUpdateTaskValue = (
    taskId: string,
    field: keyof Pick<Task, 'urgencia' | 'necesidad' | 'costo' | 'duracion'>,
    newValue: number
  ) => {
     if (!firestore) return;
    const task = tasks?.find(t => t.id === taskId);
    if (task) {
      const taskRef = doc(firestore, 'users', SHARED_USER_ID, 'tasks', taskId);
      const updatedTask = { ...task, [field]: newValue };

      const num = updatedTask.urgencia + updatedTask.necesidad;
      const den = updatedTask.costo + updatedTask.duracion;
      let newIndice;
      if (den === 0) {
        newIndice = num > 0 ? Infinity : 0;
      } else {
        newIndice = num / den;
      }
      if (isNaN(newIndice)) {
        newIndice = 0;
      }
      updatedTask.indice = newIndice;
      
      updateDocumentNonBlocking(taskRef, {
        [field]: newValue,
        indice: newIndice,
      });

      toast({
        title: "Tarea actualizada",
        description: `El campo "${field}" ha sido actualizado. Nuevo índice: ${newIndice.toFixed(2)}`,
      });
    }
  };


  if (isUserLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 min-h-screen flex flex-col">
      <header className="my-2 md:my-4 text-center">
        <h1 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
          Task Ranker
        </h1>
      </header>

      <main className="flex-grow flex flex-col space-y-6">
        <section>
          <TaskForm onAddTask={handleAddTask} />
        </section>

        <section className="flex-grow flex flex-col">
          {isLoadingTasks ? (
            <p className="text-center text-muted-foreground py-4">Cargando tareas...</p>
          ) : (
            <div className="flex-grow">
              <TaskList
                tasks={tasks || []}
                onToggleComplete={handleToggleComplete}
                onDeleteTask={handleDeleteTask}
                onMarkSchedulingAttempted={handleMarkSchedulingAttempted}
                onUpdateTaskValue={handleUpdateTaskValue}
              />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
