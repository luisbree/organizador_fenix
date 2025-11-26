
"use client";

import * as React from 'react';
import type { Task, SubTask } from '@/types/task';
import { TaskForm } from '@/components/TaskForm';
import { TaskList } from '@/components/TaskList';
import { TaskSearch } from '@/components/TaskSearch';
import { useToast } from "@/hooks/use-toast";
import { useAuth, useCollection, useFirestore, useUser } from '@/firebase';
import { collection, doc, serverTimestamp, runTransaction, onSnapshot } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { useMemoFirebase } from '@/firebase/provider';
import { Loader2 } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';

const SHARED_USER_ID = "shared_user";

export default function HomePage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  useEffect(() => {
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [isUserLoading, user, auth]);

  const tasksQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users', SHARED_USER_ID, 'tasks');
  }, [firestore]);

  const { data: tasksData, isLoading: isLoadingTasks } = useCollection<Task>(tasksQuery);

  const [tasks, setTasks] = useState<Task[] | null>(null);

  useEffect(() => {
    if (tasksData) {
        // Initially set tasks without subtasks
        const initialTasks = tasksData.map(t => ({ ...t, subtasks: t.subtasks || [] }));
        setTasks(initialTasks);

        if (!firestore) return;

        // Set up listeners for subtasks for each task
        const unsubscribers = tasksData.map(task => {
            const subtasksColRef = collection(firestore, 'users', SHARED_USER_ID, 'tasks', task.id, 'subtasks');
            
            return onSnapshot(subtasksColRef, (snapshot) => {
                const fetchedSubtasks = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as SubTask[];
                
                setTasks(currentTasks => {
                    // This check is important to avoid updating state if the component has unmounted
                    if (!currentTasks) return null;
                    return currentTasks.map(t =>
                        t.id === task.id ? { ...t, subtasks: fetchedSubtasks } : t
                    );
                });
            }, (error) => {
                console.error(`Error fetching subtasks for task ${task.id}: `, error);
            });
        });

        // Cleanup listeners on component unmount or when tasksData changes
        return () => {
            unsubscribers.forEach(unsub => unsub());
        };
    } else {
        setTasks(null); // Clear tasks if tasksData is null
    }
  }, [tasksData, firestore]);
  
  const handleSelectTask = (taskId: string | null) => {
    setSelectedTaskId(current => (current === taskId ? null : taskId));
  };


  const handleAddTask = (taskData: Omit<Task, 'id' | 'indice' | 'completado' | 'createdAt' | 'scheduledAt'> & { rawTarea: string }) => {
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
      scheduledAt: null,
    };
    
    addDocumentNonBlocking(tasksQuery, {
      ...newTask,
      createdAt: serverTimestamp(),
    });
  };

  const handleAddSubTask = (subTaskData: { tarea: string, parentId: string }) => {
    if (!firestore) return;
    const subtaskQuery = collection(firestore, 'users', SHARED_USER_ID, 'tasks', subTaskData.parentId, 'subtasks');
    const newSubTask: Omit<SubTask, 'id' | 'createdAt'> = {
        ...subTaskData,
        completado: false,
    };
    addDocumentNonBlocking(subtaskQuery, {
        ...newSubTask,
        createdAt: serverTimestamp(),
    });
    toast({
      title: "Subtarea añadida",
      description: `"${subTaskData.tarea}" ha sido añadida.`,
    });
  };

  const handleToggleComplete = (id: string) => {
    if (!firestore) return;
    const taskRef = doc(firestore, 'users', SHARED_USER_ID, 'tasks', id);
    const task = tasks?.find(t => t.id === id);
    if(task) {
      if (task.completado) {
        updateDocumentNonBlocking(taskRef, { 
          completado: false,
          createdAt: serverTimestamp() 
        });
        toast({
          title: "Tarea reactivada",
          description: "La tarea vuelve a estar activa y su envejecimiento se ha reiniciado.",
        });
      } else {
        updateDocumentNonBlocking(taskRef, { completado: true });
        toast({
          title: "¡Tarea completada!",
          description: "¡Buen trabajo!",
        });
      }
    }
  };
  
  const handleToggleSubTaskComplete = (subTaskId: string, parentId: string) => {
    if (!firestore) return;
    const subTaskRef = doc(firestore, 'users', SHARED_USER_ID, 'tasks', parentId, 'subtasks', subTaskId);
    const parentTask = tasks?.find(t => t.id === parentId);
    const subTask = parentTask?.subtasks?.find(st => st.id === subTaskId);

    if (subTask) {
        updateDocumentNonBlocking(subTaskRef, { completado: !subTask.completado });
        toast({
            title: `Subtarea ${subTask.completado ? 'reactivada' : 'completada'}`,
        });
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!firestore) return;

    const taskRef = doc(firestore, 'users', SHARED_USER_ID, 'tasks', id);
    
    try {
        await runTransaction(firestore, async (transaction) => {
            const taskDoc = await transaction.get(taskRef);
            if (!taskDoc.exists()) {
                throw "Document does not exist!";
            }

            // In a real production app, you'd use a Cloud Function to delete subcollections.
            // Deleting from the client is not scalable or secure.
            // For this app, we'll just delete the parent task.
            transaction.delete(taskRef);
        });
        toast({
            title: "Tarea eliminada",
            description: "La tarea principal ha sido eliminada.",
        });
    } catch (error) {
        console.error("Error deleting task: ", error);
        toast({
            variant: "destructive",
            title: "Error al eliminar",
            description: "No se pudo eliminar la tarea.",
        });
    }
  };

  const handleDeleteSubTask = (subTaskId: string, parentId: string) => {
    if (!firestore) return;
    const subTaskRef = doc(firestore, 'users', SHARED_USER_ID, 'tasks', parentId, 'subtasks', subTaskId);
    deleteDocumentNonBlocking(subTaskRef);
    toast({
      title: "Subtarea eliminada",
    });
  };


  const handleMarkSchedulingAttempted = (id: string) => {
    if (!firestore) return;
    const taskRef = doc(firestore, 'users', SHARED_USER_ID, 'tasks', id);
    updateDocumentNonBlocking(taskRef, { scheduledAt: serverTimestamp() });
  };
  
  const handleMarkSubTaskSchedulingAttempted = (subTaskId: string, parentId: string) => {
    if (!firestore) return;
    const subTaskRef = doc(firestore, 'users', SHARED_USER_ID, 'tasks', parentId, 'subtasks', subTaskId);
    updateDocumentNonBlocking(subTaskRef, { scheduledAt: serverTimestamp() });
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
  
  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter(task => 
      task.tarea.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.subtasks && task.subtasks.some(st => st.tarea.toLowerCase().includes(searchQuery.toLowerCase())))
    );
  }, [tasks, searchQuery]);


  if (isUserLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Cargando...</p>
      </div>
    );
  }
  
  const selectedTask = tasks?.find(t => t.id === selectedTaskId);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 min-h-screen flex flex-col">
      <header className="my-2 md:my-4 text-center">
        <h1 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
          Task Ranker
        </h1>
      </header>

      <main className="flex-grow flex flex-col space-y-6">
        <section>
          <TaskForm 
            onAddTask={handleAddTask} 
            onAddSubTask={handleAddSubTask}
            selectedTaskId={selectedTaskId}
          />
        </section>
        
        <section className="w-full">
          <TaskSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        </section>

        <section className="flex-grow flex flex-col">
          {(isLoadingTasks && !tasks) ? (
            <p className="text-center text-muted-foreground py-4">Cargando tareas...</p>
          ) : (
            <div className="flex-grow">
              <TaskList
                tasks={filteredTasks || []}
                onToggleComplete={handleToggleComplete}
                onDeleteTask={handleDeleteTask}
                onMarkSchedulingAttempted={handleMarkSchedulingAttempted}
                onUpdateTaskValue={handleUpdateTaskValue}
                onSelectTask={handleSelectTask}
                selectedTaskId={selectedTaskId}
                onToggleSubTaskComplete={handleToggleSubTaskComplete}
                onDeleteSubTask={handleDeleteSubTask}
                onMarkSubTaskSchedulingAttempted={handleMarkSubTaskSchedulingAttempted}
              />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
