
export type LanguageStrings = {
  locale: string;
  speechLang: string;
  loading: string;
  settings: string;
  language: string;
  loadingTasks: string;
  // Toasts
  fenixRebornTitle: string;
  fenixRebornDescription: string;
  subtaskAddedTitle: string;
  subtaskAddedDescription: string;
  taskReactivatedTitle: string;
  taskReactivatedDescription: string;
  fenixTaskCompletedTitle: string;
  fenixTaskCompletedDescription: (days: number) => string;
  taskCompletedTitle: string;
  taskCompletedDescription: string;
  subtaskReactivatedTitle: string;
  subtaskCompletedTitle: string;
  taskDeletedTitle: string;
  taskDeletedDescription: string;
  deleteErrorTitle: string;
  deleteErrorDescription: string;
  subtaskDeletedTitle: string;
  taskUpdatedTitle: string;
  taskUpdatedDescription: (field: string) => string;
  newIndex: string;
  taskNameUpdatedTitle: string;
  fenixPeriodUpdatedTitle: string;
  // List Manager
  selectListPlaceholder: string;
  addListAriaLabel: string;
  addListTitle: string;
  listNamePlaceholder: string;
  addListButton: string;
  deleteListAriaLabel: (listName: string) => string;
  confirmDeleteListTitle: string;
  confirmDeleteListDescription: (listName: string) => string;
  listAddedTitle: string;
  listAddedDescription: (listName: string) => string;
  cannotDeleteListTitle: string;
  cannotDeleteListDescription: string;
  listDeletedTitle: string;
  // Editable Cell
  invalidValueTitle: string;
  invalidValueDescription: (min: number, max: number) => string;
  editValueAriaLabel: string;
  editValueTooltip: (value: number) => string;
  // Fenix Period Editor
  fenixRebirthPeriodTitle: string;
  fenixRebirthPeriodDescription: string;
  // SubTaskItem
  completeSubtaskAriaLabel: (name: string) => string;
  confirmCompletionTitle: string;
  confirm: string;
  toggleScheduledTooltip: string;
  scheduleSubtaskAriaLabel: (name: string) => string;
  deleteSubtaskAriaLabel: (name: string) => string;
  deleteSubtaskTooltip: string;
  confirmDeleteSubtaskTitle: string;
  confirmDeleteSubtaskDescription: (name: string) => string;
  cancel: string;
  confirmDelete: string;
  // TaskForm
  cannotAddSubtaskDescription: string;
  taskAddedTitle: string;
  taskAddedDescription: string;
  invalidValuesErrorTitle: string;
  invalidValuesErrorDescription: string;
  formatNotRecognizedTitle: string;
  formatNotRecognizedDescription: (text: string) => string;
  unsupportedBrowserTitle: string;
  unsupportedBrowserDescription: string;
  speechErrorGeneric: string;
  speechErrorNoSpeech: string;
  speechErrorAudioCapture: string;
  speechErrorNotAllowed: string;
  speechErrorTitle: string;
  noSpeechDetectedTitle: string;
  noSpeechDetectedDescription: string;
  micUnavailableTitle: string;
  micUnavailableDescription: string;
  micPermissionPendingTitle: string;
  micPermissionPendingDescription: string;
  micStartErrorTitle: string;
  micStartErrorDescription: string;
  selectListToStart: string;
  subtaskDictationPrompt: string;
  taskDictationPrompt: string;
  taskCompletedPlaceholder: string;
  subtaskPlaceholder: string;
  taskPlaceholder: string;
  addSubtaskButton: string;
  addTaskButton: string;
  micAccessRequiredTitle: string;
  micAccessRequiredDescription: string;
  stopRecordingAriaLabel: string;
  startRecordingAriaLabel: string;
  fenix: string;
  days: string;
  manualInputAriaLabel: string;
  emptyFieldTitle: string;
  emptyFieldDescription: string;
  formatTitle: string;
  formatDescription: string;
  formatExample: string;
  sortBy: {
    index: string;
    age: string;
  };
  // TaskItem
  urgency: string;
  necessity: string;
  cost: string;
  duration: string;
  reactivateTaskAriaLabel: (name: string) => string;
  completeTaskAriaLabel: (name: string) => string;
  fenixTaskTooltip: (days: number) => string;
  scheduleTaskAriaLabel: (name: string) => string;
  deleteTaskAriaLabel: (name: string) => string;
  deleteTaskTooltip: string;
  confirmDeleteTaskTitle: string;
  confirmDeleteTaskDescription: (name: string) => string;
  // TaskList
  noTasksTitle: string;
  noTasksDescription: string;
  // TaskSearch
  micUnsupportedDescription: string;
  searchPlaceholder: string;
  searchAriaLabel: string;
  clearSearchAriaLabel: string;
  searchByVoiceAriaLabel: string;
};

export const translations: Record<'es' | 'en' | 'pt', LanguageStrings> = {
  es: {
    locale: 'es-ES',
    speechLang: 'es-ES',
    loading: 'Cargando...',
    settings: 'Configuración',
    language: 'Idioma',
    loadingTasks: 'Cargando tareas...',
    fenixRebornTitle: '¡Tareas Fénix han renacido!',
    fenixRebornDescription: 'Algunas de tus tareas recurrentes han vuelto a la vida.',
    subtaskAddedTitle: 'Subtarea añadida',
    subtaskAddedDescription: 'ha sido añadida.',
    taskReactivatedTitle: 'Tarea reactivada',
    taskReactivatedDescription: 'La tarea vuelve a estar activa y su envejecimiento se ha reiniciado.',
    fenixTaskCompletedTitle: 'Tarea Fénix completada',
    fenixTaskCompletedDescription: (days) => `renacerá en ${days} días.`,
    taskCompletedTitle: '¡Tarea completada!',
    taskCompletedDescription: '¡Buen trabajo!',
    subtaskReactivatedTitle: 'Subtarea reactivada',
    subtaskCompletedTitle: 'Subtarea completada',
    taskDeletedTitle: 'Tarea eliminada',
    taskDeletedDescription: 'La tarea principal ha sido eliminada.',
    deleteErrorTitle: 'Error al eliminar',
    deleteErrorDescription: 'No se pudo eliminar la tarea.',
    subtaskDeletedTitle: 'Subtarea eliminada',
    taskUpdatedTitle: 'Tarea actualizada',
    taskUpdatedDescription: (field) => `El campo "${field}" ha sido actualizado.`,
    newIndex: 'Nuevo índice:',
    taskNameUpdatedTitle: 'Nombre de tarea actualizado',
    fenixPeriodUpdatedTitle: 'Período Fénix actualizado',
    selectListPlaceholder: 'Seleccionar una lista',
    addListAriaLabel: 'Añadir nueva lista',
    addListTitle: 'Añadir nueva lista',
    listNamePlaceholder: 'Nombre de la lista',
    addListButton: 'Añadir lista',
    deleteListAriaLabel: (listName) => `Eliminar lista ${listName}`,
    confirmDeleteListTitle: '¿Eliminar esta lista?',
    confirmDeleteListDescription: (listName) => `La lista "${listName}" y todas sus tareas serán eliminadas permanentemente. Esta acción no se puede deshacer.`,
    listAddedTitle: 'Lista añadida',
    listAddedDescription: (listName) => `La lista "${listName}" ha sido creada.`,
    cannotDeleteListTitle: 'No se puede eliminar',
    cannotDeleteListDescription: 'No se puede eliminar la única lista existente.',
    listDeletedTitle: 'Lista eliminada',
    invalidValueTitle: 'Valor inválido',
    invalidValueDescription: (min, max) => `El valor debe ser un número entre ${min} y ${max}.`,
    editValueAriaLabel: 'Editar valor',
    editValueTooltip: (value) => `Valor actual: ${value}. Click para editar.`,
    fenixRebirthPeriodTitle: 'Período de Renacimiento',
    fenixRebirthPeriodDescription: 'Días hasta que la tarea reaparezca tras completarse.',
    completeSubtaskAriaLabel: (name) => `Marcar ${name} como completada`,
    confirmCompletionTitle: 'Confirmar Tarea Completada',
    confirm: 'Confirmar',
    toggleScheduledTooltip: 'Marcar como agendado',
    scheduleSubtaskAriaLabel: (name) => `Programar subtarea ${name} en Google Calendar`,
    deleteSubtaskAriaLabel: (name) => `Eliminar subtarea ${name}`,
    deleteSubtaskTooltip: 'Eliminar subtarefa',
    confirmDeleteSubtaskTitle: '¿Eliminar esta subtarea?',
    confirmDeleteSubtaskDescription: (name) => `La subtarea "${name}" será eliminada permanentemente.`,
    cancel: 'Cancelar',
    confirmDelete: 'Sí, eliminar',
    cannotAddSubtaskDescription: 'No se pueden añadir subtareas a una tarea completada.',
    taskAddedTitle: 'Tarea añadida',
    taskAddedDescription: 'ha sido añadida a la lista.',
    invalidValuesErrorTitle: 'Error en los valores',
    invalidValuesErrorDescription: 'Los valores numéricos (urgencia, necesidad, costo, duración) deben ser números entre 0 y 5. El formato detectado no es válido.',
    formatNotRecognizedTitle: 'Formato no reconocido',
    formatNotRecognizedDescription: (text) => `No se pudo entender: "${text}". Asegúrate de usar el formato: descripción, seguido de los cuatro números (0-5) separados o juntos.`,
    unsupportedBrowserTitle: 'Navegador no compatible',
    unsupportedBrowserDescription: 'Tu navegador no soporta el reconocimiento de voz.',
    speechErrorGeneric: 'Ocurrió un error durante el reconocimiento de voz.',
    speechErrorNoSpeech: 'No se detectó voz. Inténtalo de nuevo.',
    speechErrorAudioCapture: 'Problema con la captura de audio. Asegúrate que el micrófono funciona.',
    speechErrorNotAllowed: 'Acceso al micrófono denegado. Habilítalo en la configuración.',
    speechErrorTitle: 'Error de Reconocimiento',
    noSpeechDetectedTitle: 'No se detectó voz',
    noSpeechDetectedDescription: 'No se escuchó nada. Inténtalo de nuevo.',
    micUnavailableTitle: 'Micrófono no disponible',
    micUnavailableDescription: 'Por favor, otorga permisos para el micrófono o actualiza la página si ya los diste.',
    micPermissionPendingTitle: 'Permiso de Micrófono Pendiente',
    micPermissionPendingDescription: 'Esperando confirmación del permiso para usar el micrófono.',
    micStartErrorTitle: 'Error al iniciar grabación',
    micStartErrorDescription: 'No se pudo iniciar el reconocimiento de voz. Intenta de nuevo.',
    selectListToStart: 'Selecciona una lista para empezar',
    subtaskDictationPrompt: 'Presiona para dictar una subtarea.',
    taskDictationPrompt: 'Presiona el micrófono o escribe para añadir una tarea.',
    taskCompletedPlaceholder: 'La tarea está completada',
    subtaskPlaceholder: 'Ej: Comprar pasador...',
    taskPlaceholder: 'Ej: Comprar leche 5 4 1 2',
    addSubtaskButton: 'Añadir Subtarea',
    addTaskButton: 'Añadir Tarea',
    micAccessRequiredTitle: 'Acceso al Micrófono Requerido',
    micAccessRequiredDescription: 'Para usar el ingreso por voz, habilita el acceso al micrófono en la configuración de tu navegador y actualiza la página. Aún puedes ingresar tareas por texto.',
    stopRecordingAriaLabel: 'Detener grabación',
    startRecordingAriaLabel: 'Iniciar grabación de tarea',
    fenix: 'Fénix',
    days: 'días',
    manualInputAriaLabel: 'Ingresar tarea manualmente',
    emptyFieldTitle: 'Campo vacío',
    emptyFieldDescription: 'Por favor, escribe la tarea y sus valores.',
    formatTitle: 'Formato',
    formatDescription: '"Descripción U N C D" (0-5).',
    formatExample: 'Ej: "Pasear al perro 5312" o "Pasear al perro 5 3 1 2".',
    sortBy: {
      index: 'Índice',
      age: 'Antigüedad',
    },
    urgency: 'Urgencia',
    necessity: 'Necesidad',
    cost: 'Costo',
    duration: 'Duración',
    reactivateTaskAriaLabel: (name) => `Reactivar ${name}`,
    completeTaskAriaLabel: (name) => `Marcar ${name} como completada`,
    fenixTaskTooltip: (days) => `Tarea Fénix (renace cada ${days} días)`,
    scheduleTaskAriaLabel: (name) => `Programar tarea ${name} en Google Calendar`,
    deleteTaskAriaLabel: (name) => `Eliminar tarea ${name}`,
    deleteTaskTooltip: 'Eliminar tarea',
    confirmDeleteTaskTitle: '¿Eliminar esta tarea?',
    confirmDeleteTaskDescription: (name) => `La tarea "${name}" será eliminada permanentemente.`,
    noTasksTitle: 'No hay tareas pendientes.',
    noTasksDescription: '¡Añade una nueva tarea para empezar!',
    micUnsupportedDescription: 'El reconocimiento de voz no es compatible o no está permitido en este navegador.',
    searchPlaceholder: 'Buscar tareas...',
    searchAriaLabel: 'Buscar tareas',
    clearSearchAriaLabel: 'Limpiar búsqueda',
    searchByVoiceAriaLabel: 'Buscar por voz',
  },
  en: {
    locale: 'en-US',
    speechLang: 'en-US',
    loading: 'Loading...',
    settings: 'Settings',
    language: 'Language',
    loadingTasks: 'Loading tasks...',
    fenixRebornTitle: 'Fenix Tasks have been reborn!',
    fenixRebornDescription: 'Some of your recurring tasks have come back to life.',
    subtaskAddedTitle: 'Subtask added',
    subtaskAddedDescription: 'has been added.',
    taskReactivatedTitle: 'Task reactivated',
    taskReactivatedDescription: 'The task is active again and its aging has been reset.',
    fenixTaskCompletedTitle: 'Fenix Task completed',
    fenixTaskCompletedDescription: (days) => `will be reborn in ${days} days.`,
    taskCompletedTitle: 'Task completed!',
    taskCompletedDescription: 'Good job!',
    subtaskReactivatedTitle: 'Subtask reactivated',
    subtaskCompletedTitle: 'Subtask completed',
    taskDeletedTitle: 'Task deleted',
    taskDeletedDescription: 'The main task has been deleted.',
    deleteErrorTitle: 'Error deleting',
    deleteErrorDescription: 'Could not delete the task.',
    subtaskDeletedTitle: 'Subtask deleted',
    taskUpdatedTitle: 'Task updated',
    taskUpdatedDescription: (field) => `The field "${field}" has been updated.`,
    newIndex: 'New index:',
    taskNameUpdatedTitle: 'Task name updated',
    fenixPeriodUpdatedTitle: 'Fenix period updated',
    selectListPlaceholder: 'Select a list',
    addListAriaLabel: 'Add new list',
    addListTitle: 'Add new list',
    listNamePlaceholder: 'List name',
    addListButton: 'Add list',
    deleteListAriaLabel: (listName) => `Delete list ${listName}`,
    confirmDeleteListTitle: 'Delete this list?',
    confirmDeleteListDescription: (listName) => `The list "${listName}" and all its tasks will be permanently deleted. This action cannot be undone.`,
    listAddedTitle: 'List added',
    listAddedDescription: (listName) => `The list "${listName}" has been created.`,
    cannotDeleteListTitle: 'Cannot delete',
    cannotDeleteListDescription: 'You cannot delete the only existing list.',
    listDeletedTitle: 'List deleted',
    invalidValueTitle: 'Invalid value',
    invalidValueDescription: (min, max) => `The value must be a number between ${min} and ${max}.`,
    editValueAriaLabel: 'Edit value',
    editValueTooltip: (value) => `Current value: ${value}. Click to edit.`,
    fenixRebirthPeriodTitle: 'Rebirth Period',
    fenixRebirthPeriodDescription: 'Days until the task reappears after completion.',
    completeSubtaskAriaLabel: (name) => `Mark ${name} as completed`,
    confirmCompletionTitle: 'Confirm Task Completion',
    confirm: 'Confirm',
    toggleScheduledTooltip: 'Mark as scheduled',
    scheduleSubtaskAriaLabel: (name) => `Schedule subtask ${name} in Google Calendar`,
    deleteSubtaskAriaLabel: (name) => `Delete subtask ${name}`,
    deleteSubtaskTooltip: 'Delete subtask',
    confirmDeleteSubtaskTitle: 'Delete this subtask?',
    confirmDeleteSubtaskDescription: (name) => `The subtask "${name}" will be permanently deleted.`,
    cancel: 'Cancel',
    confirmDelete: 'Yes, delete',
    cannotAddSubtaskDescription: 'Cannot add subtasks to a completed task.',
    taskAddedTitle: 'Task added',
    taskAddedDescription: 'has been added to the list.',
    invalidValuesErrorTitle: 'Error in values',
    invalidValuesErrorDescription: 'The numeric values (urgency, necessity, cost, duration) must be numbers between 0 and 5. The detected format is not valid.',
    formatNotRecognizedTitle: 'Format not recognized',
    formatNotRecognizedDescription: (text) => `Could not understand: "${text}". Make sure to use the format: description, followed by the four numbers (0-5) separated or together.`,
    unsupportedBrowserTitle: 'Browser not supported',
    unsupportedBrowserDescription: 'Your browser does not support speech recognition.',
    speechErrorGeneric: 'An error occurred during speech recognition.',
    speechErrorNoSpeech: 'No speech was detected. Please try again.',
    speechErrorAudioCapture: 'Problem with audio capture. Make sure the microphone is working.',
    speechErrorNotAllowed: 'Microphone access denied. Enable it in your browser settings.',
    speechErrorTitle: 'Recognition Error',
    noSpeechDetectedTitle: 'No speech detected',
    noSpeechDetectedDescription: 'Nothing was heard. Please try again.',
    micUnavailableTitle: 'Microphone not available',
    micUnavailableDescription: 'Please grant microphone permissions or refresh the page if you already have.',
    micPermissionPendingTitle: 'Microphone Permission Pending',
    micPermissionPendingDescription: 'Waiting for microphone permission confirmation.',
    micStartErrorTitle: 'Error starting recording',
    micStartErrorDescription: 'Could not start speech recognition. Please try again.',
    selectListToStart: 'Select a list to start',
    subtaskDictationPrompt: 'Press to dictate a subtask.',
    taskDictationPrompt: 'Press the microphone or type to add a task.',
    taskCompletedPlaceholder: 'The task is completed',
    subtaskPlaceholder: 'e.g., Buy a pin...',
    taskPlaceholder: 'e.g., Buy milk 5 4 1 2',
    addSubtaskButton: 'Add Subtask',
    addTaskButton: 'Add Task',
    micAccessRequiredTitle: 'Microphone Access Required',
    micAccessRequiredDescription: 'To use voice input, enable microphone access in your browser settings and refresh the page. You can still enter tasks by text.',
    stopRecordingAriaLabel: 'Stop recording',
    startRecordingAriaLabel: 'Start task recording',
    fenix: 'Fenix',
    days: 'days',
    manualInputAriaLabel: 'Enter task manually',
    emptyFieldTitle: 'Field empty',
    emptyFieldDescription: 'Please write the task and its values.',
    formatTitle: 'Format',
    formatDescription: '"Description U N C D" (0-5).',
    formatExample: 'e.g., "Walk the dog 5312" or "Walk the dog 5 3 1 2".',
    sortBy: {
      index: 'Index',
      age: 'Age',
    },
    urgency: 'Urgency',
    necessity: 'Necessity',
    cost: 'Cost',
    duration: 'Duration',
    reactivateTaskAriaLabel: (name) => `Reactivate ${name}`,
    completeTaskAriaLabel: (name) => `Mark ${name} as completed`,
    fenixTaskTooltip: (days) => `Fenix task (reborn every ${days} days)`,
    scheduleTaskAriaLabel: (name) => `Schedule task ${name} in Google Calendar`,
    deleteTaskAriaLabel: (name) => `Delete task ${name}`,
    deleteTaskTooltip: 'Delete task',
    confirmDeleteTaskTitle: 'Delete this task?',
    confirmDeleteTaskDescription: (name) => `The task "${name}" will be permanently deleted.`,
    noTasksTitle: 'No pending tasks.',
    noTasksDescription: 'Add a new task to get started!',
    micUnsupportedDescription: 'Speech recognition is not supported or not allowed in this browser.',
    searchPlaceholder: 'Search tasks...',
    searchAriaLabel: 'Search tasks',
    clearSearchAriaLabel: 'Clear search',
    searchByVoiceAriaLabel: 'Search by voice',
  },
  pt: {
    locale: 'pt-BR',
    speechLang: 'pt-BR',
    loading: 'Carregando...',
    settings: 'Configurações',
    language: 'Idioma',
    loadingTasks: 'Carregando tarefas...',
    fenixRebornTitle: 'Tarefas Fênix renasceram!',
    fenixRebornDescription: 'Algumas de suas tarefas recorrentes voltaram à vida.',
    subtaskAddedTitle: 'Subtarefa adicionada',
    subtaskAddedDescription: 'foi adicionada.',
    taskReactivatedTitle: 'Tarefa reativada',
    taskReactivatedDescription: 'A tarefa está ativa novamente e seu envelhecimento foi reiniciado.',
    fenixTaskCompletedTitle: 'Tarefa Fênix concluída',
    fenixTaskCompletedDescription: (days) => `renascerá em ${days} dias.`,
    taskCompletedTitle: 'Tarefa concluída!',
    taskCompletedDescription: 'Bom trabalho!',
    subtaskReactivatedTitle: 'Subtarefa reativada',
    subtaskCompletedTitle: 'Subtarefa concluída',
    taskDeletedTitle: 'Tarefa excluída',
    taskDeletedDescription: 'A tarefa principal foi excluída.',
    deleteErrorTitle: 'Erro ao excluir',
    deleteErrorDescription: 'Não foi possível excluir a tarefa.',
    subtaskDeletedTitle: 'Subtarefa excluída',
    taskUpdatedTitle: 'Tarefa atualizada',
    taskUpdatedDescription: (field) => `O campo "${field}" foi atualizado.`,
    newIndex: 'Novo índice:',
    taskNameUpdatedTitle: 'Nome da tarefa atualizado',
    fenixPeriodUpdatedTitle: 'Período Fênix atualizado',
    selectListPlaceholder: 'Selecionar uma lista',
    addListAriaLabel: 'Adicionar nova lista',
    addListTitle: 'Adicionar nova lista',
    listNamePlaceholder: 'Nome da lista',
    addListButton: 'Adicionar lista',
    deleteListAriaLabel: (listName) => `Excluir lista ${listName}`,
    confirmDeleteListTitle: 'Excluir esta lista?',
    confirmDeleteListDescription: (listName) => `A lista "${listName}" e todas as suas tarefas serão excluídas permanentemente. Esta ação não pode ser desfeita.`,
    listAddedTitle: 'Lista adicionada',
    listAddedDescription: (listName) => `A lista "${listName}" foi criada.`,
    cannotDeleteListTitle: 'Não é possível excluir',
    cannotDeleteListDescription: 'Você não pode excluir a única lista existente.',
    listDeletedTitle: 'Lista excluída',
    invalidValueTitle: 'Valor inválido',
    invalidValueDescription: (min, max) => `O valor deve ser um número entre ${min} e ${max}.`,
    editValueAriaLabel: 'Editar valor',
    editValueTooltip: (value) => `Valor atual: ${value}. Clique para editar.`,
    fenixRebirthPeriodTitle: 'Período de Renascimento',
    fenixRebirthPeriodDescription: 'Dias até que a tarefa reapareça após a conclusão.',
    completeSubtaskAriaLabel: (name) => `Marcar ${name} como concluída`,
    confirmCompletionTitle: 'Confirmar Conclusão da Tarefa',
    confirm: 'Confirmar',
    toggleScheduledTooltip: 'Marcar como agendado',
    scheduleSubtaskAriaLabel: (name) => `Agendar subtarefa ${name} no Google Calendar`,
    deleteSubtaskAriaLabel: (name) => `Excluir subtarefa ${name}`,
    deleteSubtaskTooltip: 'Excluir subtarefa',
    confirmDeleteSubtaskTitle: 'Excluir esta subtarefa?',
    confirmDeleteSubtaskDescription: (name) => `A subtarefa "${name}" será excluída permanentemente.`,
    cancel: 'Cancelar',
    confirmDelete: 'Sim, excluir',
    cannotAddSubtaskDescription: 'Não é possível adicionar subtarefas a uma tarefa concluída.',
    taskAddedTitle: 'Tarefa adicionada',
    taskAddedDescription: 'foi adicionada à lista.',
    invalidValuesErrorTitle: 'Erro nos valores',
    invalidValuesErrorDescription: 'Os valores numéricos (urgência, necessidade, custo, duração) devem ser números entre 0 e 5. O formato detectado não é válido.',
    formatNotRecognizedTitle: 'Formato não reconhecido',
    formatNotRecognizedDescription: (text) => `Não foi possível entender: "${text}". Certifique-se de usar o formato: descrição, seguida pelos quatro números (0-5) separados ou juntos.`,
    unsupportedBrowserTitle: 'Navegador não suportado',
    unsupportedBrowserDescription: 'Seu navegador não suporta reconhecimento de voz.',
    speechErrorGeneric: 'Ocorreu um erro durante o reconhecimento de voz.',
    speechErrorNoSpeech: 'Nenhuma fala foi detectada. Por favor, tente novamente.',
    speechErrorAudioCapture: 'Problema com a captura de áudio. Verifique se o microfone está funcionando.',
    speechErrorNotAllowed: 'Acesso ao microfone negado. Habilite-o nas configurações do seu navegador.',
    speechErrorTitle: 'Erro de Reconhecimento',
    noSpeechDetectedTitle: 'Nenhuma fala detectada',
    noSpeechDetectedDescription: 'Nada foi ouvido. Por favor, tente novamente.',
    micUnavailableTitle: 'Microfone não disponível',
    micUnavailableDescription: 'Por favor, conceda permissões de microfone ou atualize a página se já o fez.',
    micPermissionPendingTitle: 'Permissão de Microfone Pendente',
    micPermissionPendingDescription: 'Aguardando confirmação da permissão do microfone.',
    micStartErrorTitle: 'Erro ao iniciar a gravação',
    micStartErrorDescription: 'Não foi possível iniciar o reconhecimento de voz. Por favor, tente novamente.',
    selectListToStart: 'Selecione uma lista para começar',
    subtaskDictationPrompt: 'Pressione para ditar uma subtarefa.',
    taskDictationPrompt: 'Pressione o microfone ou digite para adicionar uma tarefa.',
    taskCompletedPlaceholder: 'A tarefa está concluída',
    subtaskPlaceholder: 'Ex: Comprar um pino...',
    taskPlaceholder: 'Ex: Comprar leite 5 4 1 2',
    addSubtaskButton: 'Adicionar Subtarefa',
    addTaskButton: 'Adicionar Tarefa',
    micAccessRequiredTitle: 'Acesso ao Microfone Necessário',
    micAccessRequiredDescription: 'Para usar a entrada de voz, habilite o acesso ao microfone nas configurações do seu navegador e atualize a página. Você ainda pode inserir tarefas por texto.',
    stopRecordingAriaLabel: 'Parar gravação',
    startRecordingAriaLabel: 'Iniciar gravação da tarefa',
    fenix: 'Fênix',
    days: 'dias',
    manualInputAriaLabel: 'Inserir tarefa manualmente',
    emptyFieldTitle: 'Campo vazio',
    emptyFieldDescription: 'Por favor, escreva a tarefa e seus valores.',
    formatTitle: 'Formato',
    formatDescription: '"Descrição U N C D" (0-5).',
    formatExample: 'Ex: "Passear com o cachorro 5312" ou "Passear com o cachorro 5 3 1 2".',
    sortBy: {
      index: 'Índice',
      age: 'Antiguidade',
    },
    urgency: 'Urgência',
    necessity: 'Necessidade',
    cost: 'Custo',
    duration: 'Duração',
    reactivateTaskAriaLabel: (name) => `Reativar ${name}`,
    completeTaskAriaLabel: (name) => `Marcar ${name} como concluída`,
    fenixTaskTooltip: (days) => `Tarefa Fênix (renasce a cada ${days} dias)`,
    scheduleTaskAriaLabel: (name) => `Agendar tarefa ${name} no Google Calendar`,
    deleteTaskAriaLabel: (name) => `Excluir tarefa ${name}`,
    deleteTaskTooltip: 'Excluir tarefa',
    confirmDeleteTaskTitle: 'Excluir esta tarefa?',
    confirmDeleteTaskDescription: (name) => `A tarefa "${name}" será excluída permanentemente.`,
    noTasksTitle: 'Nenhuma tarefa pendente.',
    noTasksDescription: 'Adicione uma nova tarefa para começar!',
    micUnsupportedDescription: 'O reconhecimento de voz não é suportado ou permitido neste navegador.',
    searchPlaceholder: 'Buscar tarefas...',
    searchAriaLabel: 'Buscar tarefas',
    clearSearchAriaLabel: 'Limpar busca',
    searchByVoiceAriaLabel: 'Buscar por voz',
  },
};
