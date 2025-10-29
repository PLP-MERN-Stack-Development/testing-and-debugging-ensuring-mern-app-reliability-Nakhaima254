import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { BugCard } from '@/components/BugCard';
import { BugForm } from '@/components/BugForm';
import { FilterBar } from '@/components/FilterBar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Plus, Bug, Loader2, LogOut } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const ITEMS_PER_PAGE = 20;


const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBug, setEditingBug] = useState(null);
  const [page, setPage] = useState(1);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch bugs with filters
  const { data: bugsData, isLoading } = useQuery({
    queryKey: ['bugs', page, statusFilter, severityFilter, priorityFilter, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(severityFilter !== 'all' && { severity: severityFilter }),
        ...(priorityFilter !== 'all' && { priority: priorityFilter }),
        ...(searchQuery && { search: searchQuery })
      });

      const response = await fetch(`http://localhost:8085/api/bugs?${params}`);
      if (!response.ok) throw new Error('Failed to fetch bugs');

      const data = await response.json();
      return { bugs: data.bugs, count: data.total };
    },
  });

  const createBugMutation = useMutation({
    mutationFn: async (newBug) => {
      const response = await fetch('http://localhost:8085/api/bugs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newBug, created_by: user.id })
      });

      if (!response.ok) throw new Error('Failed to create bug');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bugs'] });
      toast({ title: 'Success', description: 'Bug created successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create bug',
        variant: 'destructive'
      });
    },
  });

  const updateBugMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      const response = await fetch(`http://localhost:8085/api/bugs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('Failed to update bug');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bugs'] });
      toast({ title: 'Success', description: 'Bug updated successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update bug',
        variant: 'destructive'
      });
    },
  });

  const deleteBugMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`http://localhost:8085/api/bugs/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete bug');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bugs'] });
      toast({ title: 'Success', description: 'Bug deleted successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete bug',
        variant: 'destructive'
      });
    },
  });

  const handleCreateBug = async (data) => {
    await createBugMutation.mutateAsync(data);
  };

  const handleUpdateBug = async (data) => {
    if (editingBug) {
      await updateBugMutation.mutateAsync({ id: editingBug.id, updates: data });
      setEditingBug(null);
    }
  };

  const handleEdit = (id) => {
    const bug = bugsData?.bugs.find(b => b.id === id);
    if (bug) {
      setEditingBug(bug);
      setIsFormOpen(true);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this bug?')) {
      await deleteBugMutation.mutateAsync(id);
    }
  };

  const totalPages = Math.ceil((bugsData?.count || 0) / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent">
                <Bug className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Bug Tracker</h1>
                <p className="text-sm text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">All Bugs</h2>
            <p className="text-sm text-muted-foreground">
              {bugsData?.count || 0} total bugs
            </p>
          </div>
          <Button onClick={() => { setEditingBug(null); setIsFormOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            New Bug
          </Button>
        </div>

        <div className="space-y-6">
          <FilterBar
            status={statusFilter}
            severity={severityFilter}
            priority={priorityFilter}
            search={searchQuery}
            onStatusChange={setStatusFilter}
            onSeverityChange={setSeverityFilter}
            onPriorityChange={setPriorityFilter}
            onSearchChange={setSearchQuery}
          />

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !bugsData?.bugs || bugsData.bugs.length === 0 ? (
            <div className="text-center py-12">
              <Bug className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No bugs found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'all' || severityFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first bug to get started'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4">
                {bugsData?.bugs.map((bug) => (
                  <BugCard
                    key={bug.id}
                    bug={bug}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <BugForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingBug(null);
        }}
        onSubmit={editingBug ? handleUpdateBug : handleCreateBug}
        initialData={editingBug || undefined}
        isEditing={!!editingBug}
      />
    </div>
  );
};

export default Dashboard;
