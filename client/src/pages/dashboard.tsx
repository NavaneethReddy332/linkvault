import { Sidebar } from "@/components/sidebar";
import { LinkCard } from "@/components/link-card";
import { AddLinkDialog } from "@/components/add-link-dialog";
import { useVault } from "@/lib/store";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "framer-motion";

export default function Dashboard() {
  const { links, groups, activeGroupId, removeLink, searchQuery, setSearchQuery } = useVault();

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

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8 max-w-7xl mx-auto w-full">
        <header className="flex flex-col gap-6 mb-10">
          <div className="flex items-center justify-between">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your vault..." 
                className="pl-10 bg-transparent border-border/50 focus:bg-background focus:border-border transition-all rounded-full"
              />
            </div>
            
            <AddLinkDialog />
          </div>

          <div className="flex items-end justify-between border-b border-border/40 pb-4">
            <div>
              <h2 className="text-3xl font-display font-bold tracking-tight text-foreground">
                {activeGroup.name}
              </h2>
              <p className="text-muted-foreground mt-1">
                {filteredLinks.length} {filteredLinks.length === 1 ? 'link' : 'links'} saved
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredLinks.map((link) => (
              <LinkCard key={link.id} link={link} onDelete={removeLink} />
            ))}
          </AnimatePresence>
          
          {filteredLinks.length === 0 && (
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
      </main>
    </div>
  );
}
