import { useVault } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Folder, Grid, Plus, Settings, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export function Sidebar() {
  const { groups, activeGroupId, setActiveGroup, addGroup } = useVault();
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

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 border-r border-sidebar-border bg-sidebar flex flex-col z-20">
      <div className="p-6 pb-2">
        <h1 className="text-xl font-bold font-display tracking-tight flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-foreground text-background flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          Vault
        </h1>
      </div>

      <div className="px-3 py-4 flex-1 overflow-y-auto">
        <nav className="space-y-0.5">
          <button
            onClick={() => setActiveGroup('all')}
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

          <div className="pt-4 pb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between group">
            <span>Sections</span>
            <button 
              onClick={() => setIsAddingGroup(true)}
              className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-foreground"
            >
              <Plus size={14} />
            </button>
          </div>

          {groups.map((group) => (
            <button
              key={group.id}
              onClick={() => setActiveGroup(group.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 group relative",
                activeGroupId === group.id 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <Hash size={16} className="opacity-70" />
              <span className="truncate">{group.name}</span>
            </button>
          ))}

          {isAddingGroup && (
            <form onSubmit={handleAddGroup} className="px-1 py-1">
              <Input
                autoFocus
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onBlur={() => setIsAddingGroup(false)}
                placeholder="New Section..."
                className="h-8 text-sm"
              />
            </form>
          )}
        </nav>
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <div className="text-xs text-muted-foreground text-center">
          <p>Local Storage Mode</p>
        </div>
      </div>
    </aside>
  );
}
