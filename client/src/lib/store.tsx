import React, { createContext, useContext, useEffect, useState } from 'react';
import { initialData, LinkItem, Group } from './data';

// Re-defining types here for clarity in Context
export type { LinkItem, Group };

type VaultContextType = {
  links: LinkItem[];
  groups: Group[];
  activeGroupId: string | 'all';
  searchQuery: string;
  addLink: (link: Omit<LinkItem, 'id' | 'createdAt'>) => void;
  removeLink: (id: string) => void;
  addGroup: (name: string) => void;
  deleteGroup: (id: string) => void;
  setActiveGroup: (id: string | 'all') => void;
  setSearchQuery: (query: string) => void;
};

const VaultContext = createContext<VaultContextType | undefined>(undefined);

const STORAGE_KEY = 'vault_db_v1';

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const [links, setLinks] = useState<LinkItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).links : initialData.links;
  });

  const [groups, setGroups] = useState<Group[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).groups : initialData.groups;
  });

  const [activeGroupId, setActiveGroup] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ links, groups }));
  }, [links, groups]);

  const generateId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

  const addLink = (linkData: Omit<LinkItem, 'id' | 'createdAt'>) => {
    const newLink: LinkItem = {
      ...linkData,
      id: generateId(),
      createdAt: Date.now(),
    };
    setLinks(prev => [newLink, ...prev]);
  };

  const removeLink = (id: string) => {
    setLinks(prev => prev.filter(l => l.id !== id));
  };

  const addGroup = (name: string) => {
    const newGroup: Group = {
      id: generateId(),
      name,
      order: groups.length + 1,
    };
    setGroups(prev => [...prev, newGroup]);
  };

  const deleteGroup = (id: string) => {
    setGroups(prev => prev.filter(g => g.id !== id));
    // Optionally move links to 'uncategorized' or delete them. For now, we delete them.
    setLinks(prev => prev.filter(l => l.groupId !== id));
    if (activeGroupId === id) setActiveGroup('all');
  };

  return (
    <VaultContext.Provider value={{
      links,
      groups,
      activeGroupId,
      searchQuery,
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
