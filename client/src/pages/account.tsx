import { Sidebar } from "@/components/sidebar";
import { AuthModal } from "@/components/auth-modal";
import { useVault } from "@/lib/store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api";
import { format } from "date-fns";
import { User, Calendar, Link as LinkIcon, AlertTriangle, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Account() {
  const { user, logout } = useVault();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const [deleteLinksConfirm, setDeleteLinksConfirm] = useState("");
  const [deleteAccountConfirm, setDeleteAccountConfirm] = useState("");
  const [feedbackText, setFeedbackText] = useState("");

  const { data: stats } = useQuery({
    queryKey: ['account-stats'],
    queryFn: api.getAccountStats,
    enabled: !!user,
  });

  const deleteAllLinksMutation = useMutation({
    mutationFn: () => api.deleteAllLinks(deleteLinksConfirm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      queryClient.invalidateQueries({ queryKey: ['account-stats'] });
      setDeleteLinksConfirm("");
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: () => api.deleteAccount(deleteAccountConfirm),
    onSuccess: () => {
      setLocation("/");
      window.location.reload();
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex">
        <Sidebar />
        <main className="flex-1 ml-64 p-8 flex items-center justify-center">
          <p className="text-muted-foreground">Please sign in to view your account.</p>
        </main>
        <AuthModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <AuthModal />
      
      <main className="flex-1 ml-64 p-8 max-w-3xl">
        <h1 className="text-3xl font-display font-bold tracking-tight mb-8">Account</h1>

        {/* Profile Section */}
        <section className="mb-10 p-6 rounded-xl bg-card border border-card-border">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-6">
            <User size={20} /> Profile
          </h2>
          
          <div className="flex items-start gap-6">
            {user.avatar ? (
              <img src={user.avatar} alt="" className="w-16 h-16 rounded-full" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                <User size={24} />
              </div>
            )}
            
            <div className="space-y-3 flex-1">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div className="flex gap-6">
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar size={12} /> Joined
                  </p>
                  <p className="font-medium">
                    {stats?.joinedAt ? format(new Date(stats.joinedAt), 'MMMM d, yyyy') : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <LinkIcon size={12} /> Links saved
                  </p>
                  <p className="font-medium">{stats?.linkCount ?? 0}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feedback Section */}
        <section className="mb-10 p-6 rounded-xl bg-card border border-card-border">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <MessageSquare size={20} /> Feedback or Bug Report
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Found a bug or have a suggestion? Let us know!
          </p>
          <Textarea 
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Describe the issue or your suggestion..."
            className="mb-4 resize-none"
            rows={4}
          />
          <Button 
            onClick={() => {
              window.location.href = `mailto:support@vault.app?subject=Feedback&body=${encodeURIComponent(feedbackText)}`;
            }}
            disabled={!feedbackText.trim()}
          >
            Send Feedback
          </Button>
        </section>

        {/* Danger Zone */}
        <section className="p-6 rounded-xl bg-destructive/5 border border-destructive/20">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-6 text-destructive">
            <AlertTriangle size={20} /> Danger Zone
          </h2>
          
          <div className="space-y-6">
            {/* Delete All Links */}
            <div className="p-4 rounded-lg bg-background border border-border">
              <h3 className="font-medium flex items-center gap-2 mb-2">
                <Trash2 size={16} /> Delete All Links
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                This will permanently delete all your saved links. This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <Input 
                  value={deleteLinksConfirm}
                  onChange={(e) => setDeleteLinksConfirm(e.target.value)}
                  placeholder='Type "DELETE ALL MY LINKS"'
                  className="flex-1"
                />
                <Button 
                  variant="destructive"
                  disabled={deleteLinksConfirm !== "DELETE ALL MY LINKS" || deleteAllLinksMutation.isPending}
                  onClick={() => deleteAllLinksMutation.mutate()}
                >
                  Delete Links
                </Button>
              </div>
            </div>

            {/* Delete Account */}
            <div className="p-4 rounded-lg bg-background border border-destructive/30">
              <h3 className="font-medium flex items-center gap-2 mb-2 text-destructive">
                <AlertTriangle size={16} /> Delete Account
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                This will permanently delete your account and all data.
              </p>
              <p className="text-sm text-destructive font-medium mb-4">
                Warning: You will not be able to sign up again with this email for 4 days.
              </p>
              <div className="flex gap-2">
                <Input 
                  value={deleteAccountConfirm}
                  onChange={(e) => setDeleteAccountConfirm(e.target.value)}
                  placeholder='Type "DELETE MY ACCOUNT"'
                  className="flex-1"
                />
                <Button 
                  variant="destructive"
                  disabled={deleteAccountConfirm !== "DELETE MY ACCOUNT" || deleteAccountMutation.isPending}
                  onClick={() => deleteAccountMutation.mutate()}
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
