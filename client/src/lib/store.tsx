import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Group, Link } from '@shared/schema';
import * as api from './api';

export type { Group, Link };

export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  createdAt: Date;
};

type VaultContextType = {
  user: User | null;
  isLoading: boolean;
  links: Link[];
  groups: Group[];
  activeGroupId: string | 'all';
  searchQuery: string;
  showAuthModal: boolean;
  selectedLinks: string[];
  
  login: () => Promise<void>;
  logout: () => Promise<void>;
  setShowAuthModal: (show: boolean) => void;
  
  addLink: (link: { url: string; title: string; groupId: string; note?: string }) => void;
  removeLink: (id: string) => void;
  togglePin: (id: string) => void;
  addGroup: (name: string) => void;
  deleteGroup: (id: string) => void;
  setActiveGroup: (id: string | 'all') => void;
  setSearchQuery: (query: string) => void;
  toggleSelectLink: (id: string) => void;
  selectAllLinks: (linkIds: string[]) => void;
  clearSelection: () => void;
  deleteSelectedLinks: () => void;
  moveSelectedLinks: (groupId: string) => void;
};

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [activeGroupId, setActiveGroup] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedLinks, setSelectedLinks] = useState<string[]>([]);

  const { data: user, isLoading: userLoading, refetch: refetchUser } = useQuery({
    queryKey: ['user'],
    queryFn: api.getCurrentUser,
    staleTime: Infinity,
  });

  const { data: groups = [], isLoading: groupsLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: api.fetchGroups,
    enabled: !!user,
  });

  const { data: links = [], isLoading: linksLoading } = useQuery({
    queryKey: ['links'],
    queryFn: api.fetchLinks,
    enabled: !!user,
  });

  const login = useCallback(async () => {
    const url = await api.getGoogleAuthUrl();
    window.location.href = url;
  }, []);

  const logoutMutation = useMutation({
    mutationFn: api.logout,
    onSuccess: () => {
      queryClient.clear();
      window.location.href = '/';
    },
  });

  const createLinkMutation = useMutation({
    mutationFn: api.createLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: api.deleteLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
    },
  });

  const togglePinMutation = useMutation({
    mutationFn: ({ id, isPinned }: { id: string; isPinned: boolean }) => 
      api.toggleLinkPin(id, isPinned),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: api.createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: api.deleteGroup,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['links'] });
      if (activeGroupId === deletedId) setActiveGroup('all');
    },
  });

  const addLink = (linkData: { url: string; title: string; groupId: string; note?: string }) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    createLinkMutation.mutate(linkData);
  };

  const removeLink = (id: string) => {
    deleteLinkMutation.mutate(id);
  };

  const togglePin = (id: string) => {
    const link = links.find(l => l.id === id);
    if (link) {
      togglePinMutation.mutate({ id, isPinned: !link.isPinned });
    }
  };

  const addGroup = (name: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    const order = groups.length + 1;
    createGroupMutation.mutate({ name, order });
  };

  const deleteGroup = (id: string) => {
    deleteGroupMutation.mutate(id);
  };

  const deleteSelectedLinksMutation = useMutation({
    mutationFn: api.deleteLinks,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      setSelectedLinks([]);
    },
  });

  const moveSelectedLinksMutation = useMutation({
    mutationFn: ({ ids, groupId }: { ids: string[]; groupId: string }) => 
      api.moveLinks(ids, groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      setSelectedLinks([]);
    },
  });

  const toggleSelectLink = (id: string) => {
    setSelectedLinks(prev => 
      prev.includes(id) ? prev.filter(linkId => linkId !== id) : [...prev, id]
    );
  };

  const selectAllLinks = (linkIds: string[]) => {
    setSelectedLinks(linkIds);
  };

  const clearSelection = () => {
    setSelectedLinks([]);
  };

  const deleteSelectedLinks = () => {
    if (selectedLinks.length > 0) {
      deleteSelectedLinksMutation.mutate(selectedLinks);
    }
  };

  const moveSelectedLinks = (groupId: string) => {
    if (selectedLinks.length > 0) {
      moveSelectedLinksMutation.mutate({ ids: selectedLinks, groupId });
    }
  };

  return (
    <VaultContext.Provider value={{
      user: user ?? null,
      isLoading: userLoading || groupsLoading || linksLoading,
      links,
      groups,
      activeGroupId,
      searchQuery,
      showAuthModal,
      selectedLinks,
      login,
      logout: () => logoutMutation.mutateAsync(),
      setShowAuthModal,
      addLink,
      removeLink,
      togglePin,
      addGroup,
      deleteGroup,
      setActiveGroup,
      setSearchQuery,
      toggleSelectLink,
      selectAllLinks,
      clearSelection,
      deleteSelectedLinks,
      moveSelectedLinks,
    }}>
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const context = useContext(VaultContext);
  if (!context) throw new Error('useVault must be used within a VaultProvider');
  return context;
}
