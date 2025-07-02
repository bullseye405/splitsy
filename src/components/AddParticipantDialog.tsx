import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Participant {
  id: string;
  name: string;
}

interface AddParticipantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddParticipant: (name: string) => void;
  existingParticipants: Participant[];
}

export function AddParticipantDialog({ 
  open, 
  onOpenChange, 
  onAddParticipant, 
  existingParticipants 
}: AddParticipantDialogProps) {
  const [name, setName] = useState("");
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a participant name",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate names
    const nameExists = existingParticipants.some(
      p => p.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (nameExists) {
      toast({
        title: "Name already exists",
        description: "A participant with this name already exists",
        variant: "destructive",
      });
      return;
    }

    onAddParticipant(name);
    setName("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Participant</DialogTitle>
          <DialogDescription>
            Add a new person to this expense group
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="participantName" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="participantName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter participant name"
              className="h-10"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="gradient">
            Add Participant
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}