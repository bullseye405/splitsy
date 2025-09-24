import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { getAllGroups } from '@/api/groups';
import { Group } from '@/types/group';

export default function Admin() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const { data, error } = await getAllGroups();
        if (error) {
          console.error('Error fetching groups:', error);
        } else {
          setGroups(data || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const handleGroupClick = (groupId: string) => {
    navigate(`/${groupId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-8">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Admin - All Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell>
                      <Button
                        variant="link"
                        onClick={() => handleGroupClick(group.id)}
                        className="p-0 h-auto text-primary hover:underline"
                      >
                        {group.id}
                      </Button>
                    </TableCell>
                    <TableCell>{group.name}</TableCell>
                    <TableCell>{group.description || 'No description'}</TableCell>
                    <TableCell>{formatDate(group.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {groups.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No groups found
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}