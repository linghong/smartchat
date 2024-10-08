import { useState } from 'react';
import { Tag } from 'lucide-react';

import { Button } from '@/src/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/src/components/ui/dialog';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';

interface TagModalProps {
  onAddTags: (tags: string[]) => void;
  description: string;
  title: string;
  label: string;
}

export default function TagModal({
  onAddTags,
  description,
  title,
  label
}: TagModalProps) {
  const [open, setOpen] = useState(false);
  const [newTags, setNewTags] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTags.trim()) {
      const tagsArray = newTags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');
      onAddTags(tagsArray);
      setNewTags('');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Tag size={20} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={label} className="text-right">
                {label}
              </Label>
              <Input
                id={label?.toLowerCase()}
                value={newTags}
                onChange={e => setNewTags(e.target.value)}
                className="col-span-3"
                placeholder="Enter tags, separated by commas"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-100 text-slate-800 hover:bg-gray-600 hover:text-blue-50"
            >
              Add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
