import { Sidebar } from "@/components/sidebar";
import { LinkCard, LinkCardSkeleton } from "@/components/link-card";
import { AddLinkDialog } from "@/components/add-link-dialog";
import { AuthModal } from "@/components/auth-modal";
import { useVault } from "@/lib/store";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";

export default function Dashboard() {
  const { links, groups, activeGroupId, removeLink, searchQuery, setSearchQuery, user } = useVault();
  const [searchOpen, setSearchOpen] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const activeGroup = activeGroupId === 'all' 
    ? { name: 'All Links', id: 'all' } 
    : groups.find(g => g.id === activeGroupId) || { name: 'Unknown', id: 'unknown' };

  const filteredLinks = links.filter(link => {
    const matchesGroup = activeGroupId === 'all' || link.groupId === activeGroupId;
    const matchesSearch = 
      link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (link.note && link.note.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesGroup && matchesSearch;
  });

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    if (showSkeleton) {
      const timer = setTimeout(() => {
        setShowSkeleton(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [showSkeleton, links]);

  const handleSearchToggle = () => {
    if (searchOpen && searchQuery) {
      setSearchQuery('');
    }
    setSearchOpen(!searchOpen);
  };

  const handleSaving = () => {
    setShowSkeleton(true);
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
          <div className="flex items-center justify-between">
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
            
            <AddLinkDialog onSaving={handleSaving} />
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {showSkeleton && (
                <LinkCardSkeleton key="skeleton" />
              )}
              {filteredLinks.map((link) => (
                <LinkCard key={link.id} link={link} onDelete={removeLink} />
              ))}
            </AnimatePresence>
            
            {filteredLinks.length === 0 && !showSkeleton && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-20 text-center text-muted-foreground"
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
