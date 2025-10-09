import { updateGroupName } from '@/api/groups';
import { useToast } from '@/hooks/use-toast';
import useGroup from '@/hooks/useGroup';
import { Edit, Home, Share } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { Button } from './ui/button';

const GroupDashboardHeader = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [editingName, setEditingName] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [nameLoading, setNameLoading] = useState(false);

  const { id, name, description, setState } = useGroup(
    useShallow((state) => ({
      id: state.id,
      name: state.name,
      description: state.description,
      setState: state.setState,
    }))
  );

  useEffect(() => {
    if (name) {
      document.title = `${name} - Splitsy`;
    }

    return () => {
      document.title = 'Splitsy - Split Bills Made Easy';
    };
  }, [name]);

  const handleSaveName = async () => {
    if (!id || !newGroupName.trim()) return;
    setNameLoading(true);
    try {
      const { data, error } = await updateGroupName(
        id,
        newGroupName,
        description
      );
      if (error || !data) {
        toast({
          title: 'Error updating group name',
          description: error?.message || 'Could not update group name.',
          variant: 'destructive',
        });
        setNameLoading(false);
        return;
      }

      setState((state) => {
        state.name = newGroupName;
      });
      setEditingName(false);
    } catch (err) {
      toast({
        title: 'Error updating group name',
        description: String(err),
        variant: 'destructive',
      });
    } finally {
      setNameLoading(false);
    }
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/${id}`;

      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'Link copied!',
        description:
          'Share this link with your friends to add them to the group',
      });
    } catch (error) {
      toast({
        title: 'Could not copy link',
        description: 'Please copy the URL manually',
        variant: 'destructive',
      });
      console.log('Error copying link:', error);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center py-4 px-2 gap-2 md:gap-4">
      {editingName ? (
        <div className="w-full max-w-xl flex flex-col items-center gap-2">
          <input
            className="w-full text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent border-b border-blue-300 outline-none px-2 pb-1 text-center"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            disabled={nameLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveName();
              if (e.key === 'Escape') setEditingName(false);
            }}
            autoFocus
          />
          <textarea
            className="w-full text-slate-600 text-sm border-b border-blue-300 outline-none px-2 pb-1 resize-none text-center"
            value={description || ''}
            placeholder="Add a description..."
            onChange={(e) =>
              setState((state) => {
                state.description = e.target.value;
              })
            }
            disabled={nameLoading}
            rows={2}
          />
          <div className="flex gap-2 mt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveName}
              disabled={nameLoading || !newGroupName.trim()}
            >
              Save
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingName(false)}
              disabled={nameLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-xl flex flex-col items-center gap-2">
          <div className="flex items-center justify-center gap-2 w-full">
            <h1 className="w-full text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-none pb-1 text-center">
              {name}
            </h1>
          </div>
          <p className="w-full text-slate-600 mt-1 text-center">
            {description || 'Track expenses and settle debts with your group'}
          </p>
          <div className="flex gap-2 mt-1 justify-center">
            <Button
              onClick={handleHomeClick}
              variant="outline"
              size="sm"
              className="border-blue-200 hover:bg-blue-50 hover:border-blue-300 text-blue-600"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
            <Button
              onClick={handleShare}
              variant="outline"
              size="sm"
              className="border-blue-200 hover:bg-blue-50 hover:border-blue-300 text-blue-600"
            >
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button
              onClick={() => {
                setEditingName(true);
                setNewGroupName(name);
              }}
              variant="outline"
              size="sm"
              className="border-blue-200 hover:bg-blue-50 hover:border-blue-300 text-blue-600"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDashboardHeader;
