
"use client";

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import type { TaskList } from '@/types/task';
import type { LanguageStrings } from '@/lib/translations';

interface ListManagerProps {
  taskLists: TaskList[];
  activeListId: string | null;
  onSelectList: (listId: string) => void;
  onAddList: (listName: string) => void;
  onDeleteList: (listId: string) => void;
  t: LanguageStrings;
}

export function ListManager({
  taskLists,
  activeListId,
  onSelectList,
  onAddList,
  onDeleteList,
  t,
}: ListManagerProps) {
  const [newListName, setNewListName] = React.useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const activeListName = taskLists.find(list => list.id === activeListId)?.name || "";

  const handleAddList = () => {
    if (newListName.trim()) {
      onAddList(newListName.trim());
      setNewListName("");
      setIsAddDialogOpen(false);
    }
  };
  
  const handleDeleteList = () => {
    if(activeListId) {
      onDeleteList(activeListId);
    }
  }

  return (
    <div className="flex w-full items-center space-x-2 my-4">
      <Select onValueChange={onSelectList} value={activeListId || ''}>
        <SelectTrigger className="flex-grow" style={{backgroundColor: '#fdfdfd'}}>
          <SelectValue placeholder={t.selectListPlaceholder} />
        </SelectTrigger>
        <SelectContent>
          {taskLists.map((list) => (
            <SelectItem key={list.id} value={list.id}>
              {list.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" aria-label={t.addListAriaLabel}>
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t.addListTitle}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              id="list-name"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder={t.listNamePlaceholder}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddList();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleAddList}>{t.addListButton}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="icon" aria-label={t.deleteListAriaLabel(activeListName)} disabled={!activeListId || taskLists.length <= 1}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.confirmDeleteListTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.confirmDeleteListDescription(activeListName)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteList}>
              {t.confirmDelete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
