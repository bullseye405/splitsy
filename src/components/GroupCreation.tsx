import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus } from "lucide-react";

interface GroupCreationProps {
  onGroupCreated: (groupId: string, groupName: string) => void;
}

export function GroupCreation({ onGroupCreated }: GroupCreationProps) {
  const [groupName, setGroupName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const generateGroupId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast({
        title: "Group name required",
        description: "Please enter a name for your group",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    
    // Simulate brief loading for better UX
    setTimeout(() => {
      const groupId = generateGroupId();
      onGroupCreated(groupId, groupName.trim());
      setIsCreating(false);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCreateGroup();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-strong border-0">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Split Expenses</CardTitle>
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
            <Button
              onClick={handleCreateGroup}
              disabled={isCreating}
              className="w-full h-12"
              variant="gradient"
              size="lg"
            >
              {isCreating ? (
                "Creating..."
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