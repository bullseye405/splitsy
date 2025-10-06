import { createGroup } from '@/api/groups';
import { createParticipant } from '@/api/participants';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Plus, Users } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function GroupCreation() {
  const [groupName, setGroupName] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast({
        title: 'Group name required',
        description: 'Please enter a name for your group',
        variant: 'destructive',
      });
      return;
    }

    if (!participantName.trim()) {
      toast({
        title: 'Your name required',
        description: 'Please enter your name',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);

    const { data, error } = await createGroup(groupName.trim());

    if (error) {
      toast({
        title: 'Error creating group',
        description: error.message,
        variant: 'destructive',
      });
    } else if (data.id) {
      const { data: participantData, error: createParticipantError } = await createParticipant(
        participantName.trim(),
        data.id
      );
      if (createParticipantError) {
        toast({
          title: 'Error adding participant',
          description: (createParticipantError as Error).message,
          variant: 'destructive',
        });
      } else if (participantData) {
        // Automatically set the creator as the current participant
        sessionStorage.setItem(`participant_${data.id}`, participantData.id);
        
        toast({
          title: 'Group created!',
          description: `${groupName} is ready for expense tracking`,
        });
        navigate(`/${data.id}`);
      }
    }
    setIsCreating(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateGroup();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card
          className="shadow-strong border-0"
          style={{ background: '#F5F8FA' }}
        >
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-48 h-48 flex items-center justify-center">
              <img
                src="/splitsy.png"
                alt="Splitsy"
                className="w-48 h-48 rounded-lg object-cover"
              />
            </div>
            <div>

              <CardDescription className="text-base mt-2">
                Create a group to start splitting expenses with friends
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="groupName" className="text-sm font-medium">
                Group Name
              </label>
              <Input
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Trip to Paris, Dinner with friends..."
                className="h-12"
                disabled={isCreating}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="participantName" className="text-sm font-medium">
                Your Name
              </label>
              <Input
                id="participantName"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your name"
                className="h-12"
                disabled={isCreating}
              />
            </div>

            <Button
              onClick={handleCreateGroup}
              disabled={isCreating}
              className="w-full h-12"
              variant="gradient"
              size="lg"
            >
              {isCreating ? (
                'Creating...'
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Group
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
