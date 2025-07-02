import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { GroupDashboard } from "@/components/GroupDashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, ArrowLeft } from "lucide-react";

const Group = () => {
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get("group");
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const { toast } = useToast();

  // Mock data - in a real app this would come from a backend
  const mockGroupData = {
    name: "Weekend Trip",
    participants: ["Alice", "Bob", "Charlie"],
  };

  useEffect(() => {
    if (groupId) {
      // Check if user has already joined this group
      const joinedGroups = JSON.parse(localStorage.getItem("joinedGroups") || "[]");
      setHasJoined(joinedGroups.includes(groupId));
    }
  }, [groupId]);

  const handleJoinGroup = () => {
    if (!groupId) return;

    setIsJoining(true);
    
    // Simulate joining group
    setTimeout(() => {
      const joinedGroups = JSON.parse(localStorage.getItem("joinedGroups") || "[]");
      joinedGroups.push(groupId);
      localStorage.setItem("joinedGroups", JSON.stringify(joinedGroups));
      
      setHasJoined(true);
      setIsJoining(false);
      
      toast({
        title: "Joined group!",
        description: "You can now participate in this expense group",
      });
    }, 1000);
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  if (!groupId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Invalid Group Link</CardTitle>
            <CardDescription>
              This group link appears to be invalid or expired
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGoHome} className="w-full" variant="outline">
              <ArrowLeft className="w-4 h-4" />
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (hasJoined) {
    return <GroupDashboard groupId={groupId} groupName={mockGroupData.name} />;
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-strong border-0">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Join Group</CardTitle>
              <CardDescription className="text-base mt-2">
                You've been invited to join an expense group
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{mockGroupData.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {mockGroupData.participants.length} participants
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center">
                {mockGroupData.participants.map((name, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
                    {name}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleJoinGroup}
                disabled={isJoining}
                className="w-full h-12"
                variant="gradient"
                size="lg"
              >
                {isJoining ? "Joining..." : "Join Group"}
              </Button>
              
              <Button
                onClick={handleGoHome}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4" />
                Create My Own Group
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Group;