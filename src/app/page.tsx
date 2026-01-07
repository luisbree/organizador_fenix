
"use client";

import * as React from 'react';
import type { Task, SubTask, TaskList as TaskListType, SortOrder } from '@/types/task';
import { TaskForm } from '@/components/TaskForm';
import { TaskList } from '@/components/TaskList';
import { TaskSearch } from '@/components/TaskSearch';
import { ListManager } from '@/components/ListManager';
import { SortAndAgingIndicator } from '@/components/SortAndAgingIndicator';
import { useToast } from "@/hooks/use-toast";
import { useAuth, useCollection, useFirestore, useUser } from '@/firebase';
import { collection, doc, serverTimestamp, runTransaction, onSnapshot, writeBatch, query, orderBy, addDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { useMemoFirebase } from '@/firebase/provider';
import { Loader2, Settings } from 'lucide-react';
import { useEffect, useState, useMemo, useRef } from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { translations, type LanguageStrings } from '@/lib/translations';
import { AgingLeaf } from '@/components/AgingLeaf';
import { getAgingColor } from '@/components/AverageIndexGauge';


const SHARED_USER_ID = "shared_user";
const MAX_CRITICAL_TASKS = 3;

export default function HomePage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [language, setLanguage] = useState<keyof typeof translations>("es");
  const [t, setT] = useState<LanguageStrings>(translations.es);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const migrationCompletedRef = useRef(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>('index');

  useEffect(() => {
    setT(translations[language]);
  }, [language]);


  useEffect(() => {
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [isUserLoading, user, auth]);

  const taskListsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users', SHARED_USER_ID, 'taskLists'), orderBy('createdAt', 'asc'));
  }, [firestore]);

  const { data: taskListsData, isLoading: isLoadingTaskLists } = useCollection<TaskListType>(taskListsQuery);

  const migrateOldTasks = async (listId: string) => {
      if (!firestore || migrationCompletedRef.current) return;

      const oldTasksRef = collection(firestore, 'users', SHARED_USER_ID, 'tasks');
      const oldTasksSnapshot = await getDocs(oldTasksRef);

      if (!oldTasksSnapshot.empty) {
        console.log(`Found ${oldTasksSnapshot.size} old tasks to migrate to list ${listId}.`);
        
        const newTasksRef = collection(firestore, 'users', SHARED_USER_ID, 'taskLists', listId, 'tasks');
        const batch = writeBatch(firestore);

        oldTasksSnapshot.forEach(taskDoc => {
          const taskData = taskDoc.data();
          const newDocRef = doc(newTasksRef, taskDoc.id);
          batch.set(newDocRef, taskData);
          batch.delete(taskDoc.ref);
        });

        await batch.commit();
        migrationCompletedRef.current = true;
        toast({
          title: "Tareas migradas",
          description: "Tus tareas anteriores se han movido a la lista 'general'.",
        });
        console.log("Migration complete.");
      } else {
        console.log("No old tasks to migrate.");
        migrationCompletedRef.current = true;
      }
  };


  useEffect(() => {
    if (taskListsData) {
      if (taskListsData.length > 0 && !activeListId) {
        const firstListId = taskListsData[0].id;
        setActiveListId(firstListId);
        // Attempt migration if not done yet
        if (!migrationCompletedRef.current) {
            migrateOldTasks(firstListId);
        }

      } else if (taskListsData.length === 0 && !isLoadingTaskLists && firestore) {
        // Create a default list if none exist and then migrate
        console.log("No lists found, creating default 'general' list.");
        const defaultListName = "general";
        const listsColRef = collection(firestore, 'users', SHARED_USER_ID, 'taskLists');
        addDoc(listsColRef, {
          name: defaultListName,
          createdAt: serverTimestamp()
        }).then(docRef => {
          console.log(`Default list created with ID: ${docRef.id}. Now migrating old tasks.`);
          setActiveListId(docRef.id);
          // Crucially, trigger migration *after* the list is created
          migrateOldTasks(docRef.id);
        });
      }
    }
  }, [taskListsData, activeListId, isLoadingTaskLists, firestore]);
  

  const tasksQuery = useMemoFirebase(() => {
    if (!firestore || !activeListId) return null;
    return collection(firestore, 'users', SHARED_USER_ID, 'taskLists', activeListId, 'tasks');
  }, [firestore, activeListId]);

  const { data: tasksData, isLoading: isLoadingTasks } = useCollection<Task>(tasksQuery);

  const [tasks, setTasks] = useState<Task[] | null>(null);

  // Effect to check for and rebirth Fenix tasks
  useEffect(() => {
    if (tasks && firestore && activeListId) {
      const batch = writeBatch(firestore);
      let batchHasWrites = false;

      tasks.forEach(task => {
        if (task.isFenix && task.completado && task.completedAt && task.fenixPeriod) {
          const completedAtDate = 'toDate' in task.completedAt ? task.completedAt.toDate() : new Date(task.completedAt);
          const rebirthDate = new Date(completedAtDate.getTime());
          rebirthDate.setDate(rebirthDate.getDate() + task.fenixPeriod);

          if (new Date() >= rebirthDate) {
            const taskRef = doc(firestore, 'users', SHARED_USER_ID, 'taskLists', activeListId, 'tasks', task.id);
            batch.update(taskRef, {
              completado: false,
              completedAt: null,
              createdAt: serverTimestamp(), // Reset aging
            });
            batchHasWrites = true;
            console.log(`Task ${task.tarea} has been reborn!`);
          }
        }
      });
      
      if (batchHasWrites) {
        batch.commit().then(() => {
           toast({
              title: t.fenixRebornTitle,
              description: t.fenixRebornDescription,
            });
        }).catch(error => {
            console.error("Error rebirthing Fenix tasks: ", error);
        });
      }
    }
  }, [tasks, firestore, activeListId, toast, t]);

  useEffect(() => {
    if (tasksData && activeListId && firestore) {
        const initialTasks = tasksData.map(t => ({ ...t, subtasks: t.subtasks || [] }));
        setTasks(initialTasks);

        const unsubscribers = tasksData.map(task => {
            const subtasksColRef = collection(firestore, 'users', SHARED_USER_ID, 'taskLists', activeListId, 'tasks', task.id, 'subtasks');
            
            return onSnapshot(subtasksColRef, (snapshot) => {
                const fetchedSubtasks = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as SubTask[];
                
                setTasks(currentTasks => {
                    if (!currentTasks) return null;
                    return currentTasks.map(t =>
                        t.id === task.id ? { ...t, subtasks: fetchedSubtasks } : t
                    );
                });
            }, (error) => {
                console.error(`Error fetching subtasks for task ${task.id}: `, error);
            });
        });

        return () => {
            unsubscribers.forEach(unsub => unsub());
        };
    } else {
        setTasks(null);
    }
  }, [tasksData, firestore, activeListId]);
  
  const handleSelectTask = (taskId: string | null) => {
    setSelectedTaskId(current => (current === taskId ? null : taskId));
  };


  const handleAddTask = (taskData: Omit<Task, 'id' | 'indice' | 'completado' | 'createdAt' | 'scheduledAt'> & { rawTarea: string; isFenix: boolean; fenixPeriod: number; }) => {
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
      completedAt: null,
      isFenix: taskData.isFenix,
      fenixPeriod: taskData.fenixPeriod,
      isCritical: false,
    };
    
    addDocumentNonBlocking(tasksQuery, {
      ...newTask,
      createdAt: serverTimestamp(),
    });
  };

  const handleAddSubTask = (subTaskData: { tarea: string, parentId: string }) => {
    if (!firestore || !activeListId) return;
    const subtaskQuery = collection(firestore, 'users', SHARED_USER_ID, 'taskLists', activeListId, 'tasks', subTaskData.parentId, 'subtasks');
    const newSubTask: Omit<SubTask, 'id' | 'createdAt'> = {
        ...subTaskData,
        completado: false,
    };
    addDocumentNonBlocking(subtaskQuery, {
        ...newSubTask,
        createdAt: serverTimestamp(),
    });
    toast({
      title: t.subtaskAddedTitle,
      description: `"${subTaskData.tarea}" ${t.subtaskAddedDescription}`,
    });
  };

  const handleToggleComplete = (id: string) => {
    if (!firestore || !activeListId) return;
    const taskRef = doc(firestore, 'users', SHARED_USER_ID, 'taskLists', activeListId, 'tasks', id);
    const task = tasks?.find(t => t.id === id);
    if(task) {
      if (task.completado) { // Reactivating a task (manually)
        updateDocumentNonBlocking(taskRef, { 
          completado: false,
          createdAt: serverTimestamp(),
          completedAt: null 
        });
        toast({
          title: t.taskReactivatedTitle,
          description: t.taskReactivatedDescription,
        });
      } else { // Completing a task
        if (task.isFenix) {
            // For a Fenix task, just mark as complete and set the completion date
            updateDocumentNonBlocking(taskRef, { 
              completado: true,
              completedAt: serverTimestamp()
            });
            toast({
              title: t.fenixTaskCompletedTitle,
              description: `"${task.tarea}" ${t.fenixTaskCompletedDescription(task.fenixPeriod || 0)}`,
            });
        } else {
            updateDocumentNonBlocking(taskRef, { completado: true, completedAt: serverTimestamp() });
            toast({
              title: t.taskCompletedTitle,
              description: t.taskCompletedDescription,
            });
        }
      }
    }
  };
  
  const handleToggleSubTaskComplete = (subTaskId: string, parentId: string) => {
    if (!firestore || !activeListId) return;
    const subTaskRef = doc(firestore, 'users', SHARED_USER_ID, 'taskLists', activeListId, 'tasks', parentId, 'subtasks', subTaskId);
    const parentTask = tasks?.find(t => t.id === parentId);
    const subTask = parentTask?.subtasks?.find(st => st.id === subTaskId);

    if (subTask) {
        updateDocumentNonBlocking(subTaskRef, { completado: !subTask.completado });
        toast({
            title: subTask.completado ? t.subtaskReactivatedTitle : t.subtaskCompletedTitle,
        });
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!firestore || !activeListId) return;

    const taskRef = doc(firestore, 'users', SHARED_USER_ID, 'taskLists', activeListId, 'tasks', id);
    
    try {
        await runTransaction(firestore, async (transaction) => {
            const taskDoc = await transaction.get(taskRef);
            if (!taskDoc.exists()) {
                throw "Document does not exist!";
            }
            // Also need to delete subtasks in a transaction
            const subtasksRef = collection(firestore, 'users', SHARED_USER_ID, 'taskLists', activeListId, 'tasks', id, 'subtasks');
            const subtasksSnapshot = await getDocs(subtasksRef);
            subtasksSnapshot.forEach(subtaskDoc => {
                transaction.delete(subtaskDoc.ref);
            });

            transaction.delete(taskRef);
        });
        toast({
            title: t.taskDeletedTitle,
            description: t.taskDeletedDescription,
        });
    } catch (error) {
        console.error("Error deleting task: ", error);
        toast({
            variant: "destructive",
            title: t.deleteErrorTitle,
            description: t.deleteErrorDescription,
        });
    }
  };

  const handleDeleteSubTask = (subTaskId: string, parentId: string) => {
    if (!firestore || !activeListId) return;
    const subTaskRef = doc(firestore, 'users', SHARED_USER_ID, 'taskLists', activeListId, 'tasks', parentId, 'subtasks', subTaskId);
    deleteDocumentNonBlocking(subTaskRef);
    toast({
      title: t.subtaskDeletedTitle,
    });
  };

  const handleToggleScheduled = (taskId: string, currentScheduledAt: any) => {
    if (!firestore || !activeListId) return;
    const taskRef = doc(firestore, 'users', SHARED_USER_ID, 'taskLists', activeListId, 'tasks', taskId);
    updateDocumentNonBlocking(taskRef, {
      scheduledAt: currentScheduledAt ? null : serverTimestamp()
    });
  };
  
  const handleToggleSubTaskScheduled = (subTaskId: string, parentId: string, currentScheduledAt: any) => {
    if (!firestore || !activeListId) return;
    const subTaskRef = doc(firestore, 'users', SHARED_USER_ID, 'taskLists', activeListId, 'tasks', parentId, 'subtasks', subTaskId);
    updateDocumentNonBlocking(subTaskRef, {
      scheduledAt: currentScheduledAt ? null : serverTimestamp()
    });
  };

  const handleUpdateTaskValue = (
    taskId: string,
    field: keyof Pick<Task, 'urgencia' | 'necesidad' | 'costo' | 'duracion'>,
    newValue: number
  ) => {
     if (!firestore || !activeListId) return;
    const task = tasks?.find(t => t.id === taskId);
    if (task) {
      const taskRef = doc(firestore, 'users', SHARED_USER_ID, 'taskLists', activeListId, 'tasks', taskId);
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
        title: t.taskUpdatedTitle,
        description: `${t.taskUpdatedDescription(field)} ${t.newIndex}: ${newIndice.toFixed(2)}`,
      });
    }
  };

  const handleToggleCritical = (taskId: string, isCurrentlyCritical: boolean) => {
    if (!firestore || !activeListId || !tasks) return;

    const criticalTasksCount = tasks.filter(t => t.isCritical && t.id !== taskId).length;

    if (!isCurrentlyCritical && criticalTasksCount >= MAX_CRITICAL_TASKS) {
      toast({
        variant: "destructive",
        title: "Límite de tareas críticas alcanzado",
        description: `Solo puedes tener un máximo de ${MAX_CRITICAL_TASKS} tareas críticas a la vez.`,
      });
      return;
    }

    const taskRef = doc(firestore, 'users', SHARED_USER_ID, 'taskLists', activeListId, 'tasks', taskId);
    updateDocumentNonBlocking(taskRef, {
      isCritical: !isCurrentlyCritical
    });
  };
  
  const handleAddList = (listName: string) => {
    if (!firestore) return;
    const listsColRef = collection(firestore, 'users', SHARED_USER_ID, 'taskLists');
    addDoc(listsColRef, {
      name: listName,
      createdAt: serverTimestamp()
    }).then(docRef => {
      setActiveListId(docRef.id);
      toast({
        title: t.listAddedTitle,
        description: t.listAddedDescription(listName),
      });
    });
  };

  const handleDeleteList = async (listId: string) => {
    if (!firestore || (taskListsData && taskListsData.length <= 1)) {
        toast({
            title: t.cannotDeleteListTitle,
            description: t.cannotDeleteListDescription,
            variant: "destructive"
        });
        return;
    }
    const listRef = doc(firestore, 'users', SHARED_USER_ID, 'taskLists', listId);
    
    // This is a simple delete, for a real app consider deleting subcollections
    await deleteDoc(listRef);
    
    setActiveListId(null); // Will trigger effect to select a new default
    
    toast({
        title: t.listDeletedTitle
    });
  };
  
  const handleUpdateTaskName = (taskId: string, newName: string) => {
    if (!firestore || !activeListId || !newName.trim()) return;
    const taskRef = doc(firestore, 'users', SHARED_USER_ID, 'taskLists', activeListId, 'tasks', taskId);
    updateDocumentNonBlocking(taskRef, { tarea: newName.trim() });
    toast({
        title: t.taskNameUpdatedTitle,
    });
  };

  const handleUpdateFenixPeriod = (taskId: string, newPeriod: number) => {
    if (!firestore || !activeListId) return;
    const taskRef = doc(firestore, 'users', SHARED_USER_ID, 'taskLists', activeListId, 'tasks', taskId);
    updateDocumentNonBlocking(taskRef, { fenixPeriod: newPeriod });
    toast({
        title: t.fenixPeriodUpdatedTitle,
    });
  };

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter(task => 
      task.tarea.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.subtasks && task.subtasks.some(st => st.tarea.toLowerCase().includes(searchQuery.toLowerCase())))
    );
  }, [tasks, searchQuery]);

  const { averageIndex, totalDynamicIndex, averageAgingFactor } = useMemo(() => {
    if (!tasks) return { averageIndex: 0, totalDynamicIndex: 0, averageAgingFactor: 0 };
    const eligibleTasks = tasks.filter(t => !t.completado);
    if (eligibleTasks.length === 0) return { averageIndex: 0, totalDynamicIndex: 0, averageAgingFactor: 0 };

    let totalIndex = 0;
    let totalAgingFactor = 0;

    eligibleTasks.forEach(task => {
      const num = task.urgencia + task.necesidad;
      const den = task.costo + task.duracion;
      let pureIndex = den === 0 ? (num > 0 ? Infinity : 0) : num / den;
      if (isNaN(pureIndex)) pureIndex = 0;

      let agingFactor = 0;
      if (task.createdAt) {
        const createdDate = 'toDate' in task.createdAt ? task.createdAt.toDate() : new Date(task.createdAt);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        createdDate.setHours(0, 0, 0, 0);
        
        const timeDiff = today.getTime() - createdDate.getTime();
        const daysOld = Math.max(0, Math.floor(timeDiff / (1000 * 3600 * 24)));
        
        if (daysOld >= 1) {
          const factor = ((task.urgencia + task.necesidad) / 10) * Math.log(daysOld + 1);
          if (!isNaN(factor)) {
            agingFactor = factor;
          }
        }
      }
      
      const dynamicIndex = pureIndex + agingFactor;
      if (isFinite(dynamicIndex)) {
        totalIndex += dynamicIndex;
      }
      totalAgingFactor += agingFactor;
    });

    return {
      averageIndex: totalIndex / eligibleTasks.length,
      totalDynamicIndex: totalIndex,
      averageAgingFactor: totalAgingFactor / eligibleTasks.length
    };
  }, [tasks]);


  if (isUserLoading || isLoadingTaskLists) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">{t.loading}</p>
      </div>
    );
  }
  
  const selectedTask = tasks?.find(t => t.id === selectedTaskId);
  const criticalTasksCount = tasks?.filter(t => t.isCritical).length ?? 0;
  const leafColor = getAgingColor(averageAgingFactor);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 min-h-screen flex flex-col">
       <header className="my-2 md:my-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
            Fénix
            </h1>
            <AgingLeaf color={leafColor} className="h-24 w-24" />
        </div>
         <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Settings className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">{t.settings}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t.language}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={language} onValueChange={(value) => setLanguage(value as keyof typeof translations)}>
              <DropdownMenuRadioItem value="es">Español</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="pt">Português</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>


      <main className="flex-grow flex flex-col space-y-6">
        <section>
          <TaskForm 
            onAddTask={handleAddTask} 
            onAddSubTask={handleAddSubTask}
            selectedTask={selectedTask}
            tasks={tasks || []}
            averageIndex={averageIndex}
            totalDynamicIndex={totalDynamicIndex}
            averageAgingFactor={averageAgingFactor}
            t={t}
            disabled={!activeListId}
          />
        </section>
        
        <section className="w-full">
            <ListManager
                taskLists={taskListsData || []}
                activeListId={activeListId}
                onSelectList={setActiveListId}
                onAddList={handleAddList}
                onDeleteList={handleDeleteList}
                t={t}
            />
          <div className="flex items-center gap-2">
            <div className="flex-grow">
              <TaskSearch 
                searchQuery={searchQuery} 
                setSearchQuery={setSearchQuery} 
                t={t}
              />
            </div>
            <div className="flex-shrink-0">
               <SortAndAgingIndicator 
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                    t={t}
                    disabled={!activeListId}
                />
            </div>
          </div>
        </section>

        <section className="flex-grow flex flex-col">
          {(isLoadingTasks && !tasks) ? (
            <p className="text-center text-muted-foreground py-4">{t.loadingTasks}</p>
          ) : (
            <div className="flex-grow">
              <TaskList
                tasks={filteredTasks || []}
                sortOrder={sortOrder}
                onToggleComplete={handleToggleComplete}
                onDeleteTask={handleDeleteTask}
                onToggleScheduled={handleToggleScheduled}
                onUpdateTaskValue={handleUpdateTaskValue}
                onSelectTask={handleSelectTask}
                selectedTaskId={selectedTaskId}
                onToggleSubTaskComplete={handleToggleSubTaskComplete}
                onDeleteSubTask={handleDeleteSubTask}
                onToggleSubTaskScheduled={handleToggleSubTaskScheduled}
                onToggleCritical={handleToggleCritical}
                onUpdateTaskName={handleUpdateTaskName}
                onUpdateFenixPeriod={handleUpdateFenixPeriod}
                criticalTasksCount={criticalTasksCount}
                t={t}
              />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

    