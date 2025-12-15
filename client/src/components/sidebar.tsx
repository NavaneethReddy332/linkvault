import { useVault } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Grid, Plus, LogOut, User, Bookmark, Code, Briefcase, Music, Film, BookOpen, ShoppingCart, Gamepad2, Plane, Heart, Coffee, Palette, Camera, Globe, Lightbulb, Hash, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";

const sectionIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  'bookmarks': Bookmark,
  'bookmark': Bookmark,
  'saved': Bookmark,
  'code': Code,
  'coding': Code,
  'development': Code,
  'dev': Code,
  'programming': Code,
  'work': Briefcase,
  'business': Briefcase,
  'job': Briefcase,
  'career': Briefcase,
  'office': Briefcase,
  'music': Music,
  'songs': Music,
  'audio': Music,
  'movies': Film,
  'movie': Film,
  'video': Film,
  'videos': Film,
  'film': Film,
  'tv': Film,
  'entertainment': Film,
  'reading': BookOpen,
  'read': BookOpen,
  'books': BookOpen,
  'book': BookOpen,
  'articles': BookOpen,
  'learning': BookOpen,
  'education': BookOpen,
  'study': BookOpen,
  'shopping': ShoppingCart,
  'shop': ShoppingCart,
  'buy': ShoppingCart,
  'ecommerce': ShoppingCart,
  'store': ShoppingCart,
  'gaming': Gamepad2,
  'games': Gamepad2,
  'game': Gamepad2,
  'travel': Plane,
  'trips': Plane,
  'vacation': Plane,
  'holiday': Plane,
  'health': Heart,
  'fitness': Heart,
  'wellness': Heart,
  'medical': Heart,
  'food': Coffee,
  'recipes': Coffee,
  'cooking': Coffee,
  'restaurant': Coffee,
  'design': Palette,
  'art': Palette,
  'creative': Palette,
  'ui': Palette,
  'ux': Palette,
  'photo': Camera,
  'photos': Camera,
  'photography': Camera,
  'images': Camera,
  'news': Globe,
  'social': Globe,
  'websites': Globe,
  'web': Globe,
  'ideas': Lightbulb,
  'inspiration': Lightbulb,
  'later': Lightbulb,
  'todo': Lightbulb,
  'misc': Hash,
  'other': Hash,
  'general': Hash,
};

const getSectionIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  for (const [key, Icon] of Object.entries(sectionIcons)) {
    if (lowerName.includes(key)) {
      return Icon;
    }
  }
  return Hash;
};

export function Sidebar() {
  const { groups, activeGroupId, setActiveGroup, addGroup, user, logout, setShowAuthModal } = useVault();
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGroupName.trim()) {
      addGroup(newGroupName.trim());
      setNewGroupName("");
      setIsAddingGroup(false);
    }
  };

  const handleStartAddGroup = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setIsAddingGroup(true);
  };

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 border-r border-sidebar-border bg-sidebar flex flex-col z-20">
      <div className="p-6 pb-2">
        <Link href="/">
          <h1 className="text-xl font-bold font-display tracking-tight flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-6 h-6 rounded bg-foreground text-background flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            Vault
          </h1>
        </Link>
      </div>

      <div className="px-3 py-4 flex-1 overflow-y-auto">
        <nav className="space-y-0.5">
          <button
            onClick={() => setActiveGroup('all')}
            data-testid="button-all-links"
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
              activeGroupId === 'all' 
                ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            )}
          >
            <Grid size={16} />
            All Links
          </button>

          <div className="pt-4 pb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
            <span>Sections</span>
            <button 
              onClick={handleStartAddGroup}
              className="opacity-60 hover:opacity-100 transition-opacity hover:text-foreground p-0.5 rounded hover:bg-sidebar-accent/50"
              data-testid="button-add-section"
              title="Add new section"
            >
              <PlusCircle size={14} />
            </button>
          </div>

          <AnimatePresence mode="popLayout">
            {groups.map((group) => {
              const Icon = getSectionIcon(group.name);
              return (
                <motion.button
                  key={group.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setActiveGroup(group.id)}
                  data-testid={`button-group-${group.id}`}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 group relative",
                    activeGroupId === group.id 
                      ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon size={16} className="opacity-70" />
                  <span className="truncate">{group.name}</span>
                </motion.button>
              );
            })}
          </AnimatePresence>

          <AnimatePresence>
            {isAddingGroup && (
              <motion.form 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleAddGroup} 
                className="px-1 py-1 overflow-hidden"
              >
                <Input
                  autoFocus
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  onBlur={() => {
                    if (!newGroupName.trim()) {
                      setIsAddingGroup(false);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setIsAddingGroup(false);
                      setNewGroupName("");
                    }
                  }}
                  placeholder="New Section..."
                  className="h-8 text-sm"
                  data-testid="input-new-section"
                />
              </motion.form>
            )}
          </AnimatePresence>
        </nav>
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
        {user ? (
          <div className="space-y-2">
            <Link href="/account">
              <motion.button 
                whileHover={{ x: 2 }}
                transition={{ duration: 0.15 }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all"
                data-testid="button-account"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="w-6 h-6 rounded-full" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                    <User size={14} />
                  </div>
                )}
                <span className="truncate">{user.name}</span>
              </motion.button>
            </Link>
            <button 
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
              data-testid="button-logout"
            >
              <LogOut size={16} />
              <span>Sign out</span>
            </button>
          </div>
        ) : (
          <Button 
            onClick={() => setShowAuthModal(true)} 
            className="w-full"
            data-testid="button-signin"
          >
            Sign in with Google
          </Button>
        )}
      </div>
    </aside>
  );
}
