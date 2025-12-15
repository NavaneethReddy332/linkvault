import React, { createContext, useContext, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Group, Link, InsertGroup, InsertLink } from '@shared/schema';
import * as api from './api';

export type { Group, Link };

type VaultContextType = {
  links: Link[];
  groups: Group[];
  activeGroupId: string | 'all';
  searchQuery: string;
  isLoading: boolean;
  addLink: (link: InsertLink) => void;
  removeLink: (id: string) => void;
  addGroup: (name: string) => void;
  deleteGroup: (id: string) => void;
  setActiveGroup: (id: string | 'all') => void;
  setSearchQuery: (query: string) => void;
};

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [activeGroupId, setActiveGroup] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: groups = [], isLoading: groupsLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: api.fetchGroups,
  });

  const { data: links = [], isLoading: linksLoading } = useQuery({
    queryKey: ['links'],
    queryFn: api.fetchLinks,
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
      if (activeGroupId === deletedId) {
        setActiveGroup('all');
      }
    },
  });

  const addLink = (linkData: InsertLink) => {
    createLinkMutation.mutate(linkData);
  };

  const removeLink = (id: string) => {
    deleteLinkMutation.mutate(id);
  };

  const addGroup = (name: string) => {
    const order = groups.length + 1;
    createGroupMutation.mutate({ name, order });
  };

  const deleteGroup = (id: string) => {
    deleteGroupMutation.mutate(id);
  };

  return (
    <VaultContext.Provider value={{
      links,
      groups,
      activeGroupId,
      searchQuery,
      isLoading: groupsLoading || linksLoading,
      addLink,
      removeLink,
      addGroup,
      deleteGroup,
      setActiveGroup,
      setSearchQuery
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
