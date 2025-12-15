
// Simple ID generator if nanoid is not available in environment
export const generateId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

export type LinkItem = {
  id: string;
  url: string;
  title: string;
  note?: string;
  groupId: string;
  createdAt: number;
  tags?: string[];
};

export type Group = {
  id: string;
  name: string;
  icon?: string;
  order: number;
};

export const DEFAULT_GROUPS: Group[] = [
  { id: 'design', name: 'Design Inspiration', order: 1 },
  { id: 'dev', name: 'Development', order: 2 },
  { id: 'read', name: 'To Read', order: 3 },
  { id: 'tools', name: 'Tools', order: 4 },
];

export const DEFAULT_LINKS: LinkItem[] = [
  {
    id: '1',
    url: 'https://replit.com',
    title: 'Replit',
    note: 'The platform for rapid software development.',
    groupId: 'dev',
    createdAt: Date.now(),
  },
  {
    id: '2',
    url: 'https://dribbble.com',
    title: 'Dribbble',
    note: 'Design inspiration and community.',
    groupId: 'design',
    createdAt: Date.now() - 100000,
  }
];

export const initialData = {
  groups: DEFAULT_GROUPS,
  links: DEFAULT_LINKS,
};
