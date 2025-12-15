import { Sidebar } from "@/components/sidebar";
import { LinkCard, LinkCardSkeleton } from "@/components/link-card";
import { AddLinkDialog } from "@/components/add-link-dialog";
import { AuthModal } from "@/components/auth-modal";
import { useVault } from "@/lib/store";
import { Search, X, Star, Trash2, FolderInput, CheckSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Dashboard() {
  const { 
    links, 
    groups, 
    activeGroupId, 
    removeLink, 
    togglePin, 
    searchQuery, 
    setSearchQuery, 
    user,
    selectedLinks,
    toggleSelectLink,
    selectAllLinks,
    clearSelection,
    deleteSelectedLinks,
    moveSelectedLinks,
    pinningLinkIds,
    isAddingLink,
  } = useVault();
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const activeGroup = activeGroupId === 'all' 
    ? { name: 'All Links', id: 'all' } 
    : groups.find(g => g.id === activeGroupId) || { name: 'Unknown', id: 'unknown' };

  const filteredLinks = links
    .filter(link => {
      const matchesGroup = activeGroupId === 'all' || link.groupId === activeGroupId;
      const matchesSearch = 
        link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (link.note && link.note.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesGroup && matchesSearch;
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });

  const pinnedLinks = filteredLinks.filter(link => link.isPinned);
  const unpinnedLinks = filteredLinks.filter(link => !link.isPinned);
  
  const hasSelection = selectedLinks.length > 0;
  const allSelected = filteredLinks.length > 0 && filteredLinks.every(link => selectedLinks.includes(link.id));

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearchToggle = () => {
    if (searchOpen && searchQuery) {
      setSearchQuery('');
    }
    setSearchOpen(!searchOpen);
  };

  const handleSelectAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      selectAllLinks(filteredLinks.map(link => link.id));
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background text-foreground flex"
    >
      <Sidebar />
      <AuthModal />
      
      <main className="flex-1 ml-64 p-8 max-w-7xl mx-auto w-full">
        <header className="flex flex-col gap-6 mb-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center">
              <motion.div
                initial={false}
                animate={{ width: searchOpen ? 320 : 40 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="relative h-10 flex items-center overflow-hidden"
              >
                <button
                  onClick={handleSearchToggle}
                  className="absolute left-0 z-10 w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="button-search"
                >
                  {searchOpen && searchQuery ? <X size={18} /> : <Search size={18} />}
                </button>
                
                <AnimatePresence>
                  {searchOpen && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="w-full"
                    >
                      <Input 
                        ref={searchRef}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search your vault..." 
                        className="pl-10 pr-4 bg-transparent border-border/50 focus:bg-background focus:border-border transition-all rounded-full"
                        onBlur={() => {
                          if (!searchQuery) setSearchOpen(false);
                        }}
                        data-testid="input-search"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
            
            <AddLinkDialog />
          </div>

          <div className="flex items-end justify-between border-b border-border/40 pb-4">
            <div>
              <h2 className="text-3xl font-display font-bold tracking-tight text-foreground">
                {activeGroup.name}
              </h2>
              <p className="text-muted-foreground mt-1">
                {user ? (
                  <>
                    {filteredLinks.length} {filteredLinks.length === 1 ? 'link' : 'links'} saved
                  </>
                ) : (
                  'Sign in to save your links'
                )}
              </p>
            </div>
          </div>
        </header>

        <AnimatePresence>
          {hasSelection && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mb-6"
            >
              <div className="flex items-center justify-between gap-4 p-3 bg-secondary/50 rounded-lg border border-border/50">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground">
                    {selectedLinks.length} {selectedLinks.length === 1 ? 'link' : 'links'} selected
                  </span>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAll}
                    data-testid="button-select-all"
                  >
                    <CheckSquare size={14} className="mr-1.5" />
                    {allSelected ? 'Deselect All' : 'Select All'}
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        data-testid="button-move-selected"
                      >
                        <FolderInput size={14} className="mr-1.5" />
                        Move to...
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {groups.map((group) => (
                        <DropdownMenuItem
                          key={group.id}
                          onClick={() => moveSelectedLinks(group.id)}
                          data-testid={`menu-move-to-${group.id}`}
                        >
                          {group.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={deleteSelectedLinks}
                    data-testid="button-delete-selected"
                  >
                    <Trash2 size={14} className="mr-1.5" />
                    Delete Selected
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSelection}
                    data-testid="button-clear-selection"
                  >
                    <X size={14} className="mr-1.5" />
                    Clear
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!user ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center text-muted-foreground"
          >
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6 opacity-50">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <p className="text-xl font-medium mb-2">Your personal link vault awaits</p>
            <p className="text-sm opacity-60 max-w-md mx-auto">
              Sign in with Google to start saving and organizing your favorite links in one calm, private space.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {user && filteredLinks.length > 0 && !hasSelection && (
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-muted-foreground"
                  data-testid="button-select-all-top"
                >
                  <CheckSquare size={14} className="mr-1.5" />
                  Select All
                </Button>
              </div>
            )}
            
            {pinnedLinks.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Star size={14} className="text-amber-500" fill="currentColor" />
                  <span className="text-sm font-medium text-muted-foreground">Pinned</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <AnimatePresence mode="popLayout">
                    {pinnedLinks.map((link) => (
                      <LinkCard 
                        key={link.id} 
                        link={link} 
                        onDelete={removeLink} 
                        onTogglePin={togglePin}
                        isSelected={selectedLinks.includes(link.id)}
                        onToggleSelect={toggleSelectLink}
                        hasSelection={hasSelection}
                        isPinning={pinningLinkIds.has(link.id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
            
            {unpinnedLinks.length > 0 && (
              <div>
                {pinnedLinks.length > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-medium text-muted-foreground">Other Links</span>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <AnimatePresence mode="popLayout">
                    {isAddingLink && (
                      <LinkCardSkeleton key="skeleton" />
                    )}
                    {unpinnedLinks.map((link) => (
                      <LinkCard 
                        key={link.id} 
                        link={link} 
                        onDelete={removeLink} 
                        onTogglePin={togglePin}
                        isSelected={selectedLinks.includes(link.id)}
                        onToggleSelect={toggleSelectLink}
                        hasSelection={hasSelection}
                        isPinning={pinningLinkIds.has(link.id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
            
            {filteredLinks.length === 0 && !isAddingLink && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 text-center text-muted-foreground"
              >
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                  <Search size={24} />
                </div>
                <p className="text-lg font-medium">No links found</p>
                <p className="text-sm opacity-60">Try adding one or changing your search</p>
              </motion.div>
            )}
          </div>
        )}
      </main>
    </motion.div>
  );
}
