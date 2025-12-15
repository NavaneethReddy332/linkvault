import { LinkItem } from "@/lib/store";
import { ExternalLink, Trash2, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

interface LinkCardProps {
  link: LinkItem;
  onDelete: (id: string) => void;
}

export function LinkCard({ link, onDelete }: LinkCardProps) {
  // Simple favicon fetcher - in a real app might need a proxy or specialized service
  const getFavicon = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch (e) {
      return '';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col p-4 bg-card rounded-xl border border-card-border hover:shadow-sm hover:border-sidebar-border transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3 items-start overflow-hidden">
          <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center shrink-0 border border-border/50">
            <img 
              src={getFavicon(link.url)} 
              alt="" 
              className="w-5 h-5 opacity-80"
              onError={(e) => {
                // Fallback if image fails
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
              }}
            />
          </div>
          
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-foreground leading-tight truncate pr-2">
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:underline decoration-1 underline-offset-2">
                {link.title}
              </a>
            </h3>
            <p className="text-xs text-muted-foreground mt-1 truncate font-mono opacity-80">
              {new URL(link.url).hostname}
            </p>
          </div>
        </div>

        <button 
          onClick={() => onDelete(link.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md"
          title="Delete link"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {link.note && (
        <div className="mt-3 pt-3 border-t border-border/40">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {link.note}
          </p>
        </div>
      )}

      <div className="mt-auto pt-3 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
          <Clock size={10} />
          {formatDistanceToNow(link.createdAt, { addSuffix: true })}
        </span>
        
        <a 
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-sidebar-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          Visit <ExternalLink size={10} />
        </a>
      </div>
    </motion.div>
  );
}
