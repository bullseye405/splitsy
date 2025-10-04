import { deleteGroup, getAllGroups } from '@/api/groups';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Group } from '@/types/group';
import { ArrowLeft, ExternalLink, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function Admin() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { year, month, day } = useParams();

  useEffect(() => {
    // Validate the date matches today's date
    const today = new Date();
    const currentYear = today.getFullYear().toString();
    const currentMonth = (today.getMonth() + 1).toString().padStart(2, '0');
    const currentDay = today.getDate().toString().padStart(2, '0');

    if (year !== currentYear || month !== currentMonth || day !== currentDay) {
      navigate('/');
      return;
    }

    const password = prompt('Enter admin password:');
    if (password !== import.meta.env.VITE_ADMIN_PASS) {
      navigate('/');
    }
  }, [navigate, year, month, day]);

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

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${groupName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const { error } = await deleteGroup(groupId);
      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete group',
          variant: 'destructive',
        });
        console.error('Error deleting group:', error);
      } else {
        toast({
          title: 'Success',
          description: 'Group deleted successfully',
        });
        setGroups(groups.filter((g) => g.id !== groupId));
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete group',
        variant: 'destructive',
      });
    }
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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell>
                      <a
                        href={`/${group.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        {group.id}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </TableCell>
                    <TableCell>{group.name}</TableCell>
                    <TableCell>
                      {group.description || 'No description'}
                    </TableCell>
                    <TableCell>{formatDate(group.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteGroup(group.id, group.name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
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
