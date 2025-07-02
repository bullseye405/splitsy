import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { GroupCreation } from "@/components/GroupCreation";
import { GroupDashboard } from "@/components/GroupDashboard";

const Index = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [activeGroupName, setActiveGroupName] = useState<string>("");

  const groupParam = searchParams.get("group");

  useEffect(() => {
    if (groupParam) {
      // Handle group joining via URL
      navigate(`/group?group=${groupParam}`);
    }
  }, [groupParam, navigate]);

  const handleGroupCreated = (groupId: string, groupName: string) => {
    setActiveGroupId(groupId);
    setActiveGroupName(groupName);
    
    // Store in localStorage for persistence
    localStorage.setItem("currentGroup", JSON.stringify({ id: groupId, name: groupName }));
  };

  // Check for existing group on load
  useEffect(() => {
    const savedGroup = localStorage.getItem("currentGroup");
    if (savedGroup) {
      try {
        const { id, name } = JSON.parse(savedGroup);
        setActiveGroupId(id);
        setActiveGroupName(name);
      } catch (error) {
        // Invalid saved data, ignore
        localStorage.removeItem("currentGroup");
      }
    }
  }, []);

  if (activeGroupId) {
    return <GroupDashboard groupId={activeGroupId} groupName={activeGroupName} />;
  }

  return <GroupCreation onGroupCreated={handleGroupCreated} />;
};

export default Index;
