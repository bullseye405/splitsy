import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { createGroup } from '@/api/groups';
import { createParticipant } from '@/api/participants';
import { getAllGroups } from '@/api/groups';
import { supabase } from '@/integrations/supabase/client';

export function HeroSection() {
  const [groupName, setGroupName] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [relatedGroups, setRelatedGroups] = useState<Array<{id: string, name: string}>>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Load email from session storage
    const savedEmail = sessionStorage.getItem('userEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      fetchRelatedGroups(savedEmail);
    }
  }, []);

  const fetchRelatedGroups = async (userEmail: string) => {
    if (!userEmail.trim()) return;
    
    try {
      // Query participants table to find groups where this email exists
      const { data } = await supabase
        .from('participants')
        .select(`
          group_id,
          group:group_id (
            id,
            name
          )
        `)
        .eq('email', userEmail)
        .limit(5);
      
      if (data) {
        const groups = data
          .filter(item => item.group)
          .map(item => ({
            id: item.group.id,
            name: item.group.name
          }));
        setRelatedGroups(groups);
      }
    } catch (error) {
      console.error('Error fetching related groups:', error);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    sessionStorage.setItem('userEmail', value);
    
    if (value.includes('@')) {
      fetchRelatedGroups(value);
    } else {
      setRelatedGroups([]);
    }
  };

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

    const { data, error } = await createGroup(groupName.trim(), description.trim());

    if (error) {
      toast({
        title: 'Error creating group',
        description: error.message,
        variant: 'destructive',
      });
    } else if (data.id) {
      const { error: createParticipantError } = await createParticipant(
        participantName.trim(),
        data.id,
        email.trim() || undefined
      );
      if (createParticipantError) {
        toast({
          title: 'Error adding participant',
          description: (createParticipantError as Error).message,
          variant: 'destructive',
        });
      } else {
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
    <section className="min-h-screen bg-gradient-hero flex items-center justify-center px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <div className="text-center lg:text-left space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Split expenses fairly,{' '}
                <span className="text-yellow-300">without the awkwardness</span>
              </h1>
              <p className="text-xl md:text-2xl text-white/90 font-light">
                Track shared costs, settle debts and keep friendships stress-free
              </p>
            </div>

            {/* Visual element placeholder - you can replace with actual illustration */}
            <div className="hidden lg:block">
              <div className="w-96 h-64 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <div className="text-white/60 text-center">
                  <div className="text-6xl mb-4">🍽️</div>
                  <p className="text-lg">Friends dining together</p>
                  <p className="text-sm opacity-75">Illustration placeholder</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Enhanced Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <Card className="shadow-strong border-0 backdrop-blur-sm bg-white/95">
              <CardContent className="p-4 sm:p-6 lg:p-8 space-y-4 lg:space-y-6">
                <div className="text-center mb-4 lg:mb-6">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                    Create Your Group
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600">
                    Start tracking expenses in seconds
                  </p>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    <label htmlFor="groupName" className="text-sm font-medium text-gray-700">
                      Group Name *
                    </label>
                    <Input
                      id="groupName"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Trip to Paris, Dinner with friends..."
                      className="h-11 sm:h-12 text-base"
                      disabled={isCreating}
                    />
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <label htmlFor="description" className="text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <Input
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Weekend getaway expenses..."
                      className="h-11 sm:h-12 text-base"
                      disabled={isCreating}
                    />
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <label htmlFor="participantName" className="text-sm font-medium text-gray-700">
                      Your Name *
                    </label>
                    <Input
                      id="participantName"
                      value={participantName}
                      onChange={(e) => setParticipantName(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter your name"
                      className="h-11 sm:h-12 text-base"
                      disabled={isCreating}
                    />
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="your@email.com"
                      className="h-11 sm:h-12 text-base"
                      disabled={isCreating}
                    />
                    <p className="text-xs text-gray-500">
                      Find your existing groups and stay organized
                    </p>
                  </div>

                  {relatedGroups.length > 0 && (
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Your Groups
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {relatedGroups.map((group) => (
                          <Badge
                            key={group.id}
                            variant="secondary"
                            className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs sm:text-sm px-2 py-1"
                            onClick={() => navigate(`/${group.id}`)}
                          >
                            {group.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleCreateGroup}
                  disabled={isCreating}
                  className="w-full h-11 sm:h-12 text-base font-medium"
                  variant="gradient"
                  size="lg"
                >
                  {isCreating ? (
                    'Creating...'
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Group
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}