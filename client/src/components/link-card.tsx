import { Link } from "@/lib/store";
import { ExternalLink, Trash2, Star, MousePointerClick } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { trackLinkClick } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";

interface LinkCardProps {
  link: Link;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  hasSelection?: boolean;
}

export function LinkCard({ link, onDelete, onTogglePin, isSelected = false, onToggleSelect, hasSelection = false }: LinkCardProps) {
  const getFavicon = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch (e) {
      return '';
    }
  };

  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch (e) {
      return url;
    }
  };

  const handleLinkClick = async () => {
    try {
      await trackLinkClick(link.id);
      queryClient.invalidateQueries({ queryKey: ['links'] });
    } catch (e) {
      // silently fail - don't prevent navigation
    }
  };

  return (
    <TooltipProvider delayDuration={400}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            layout="position"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className={`group relative flex items-center gap-3 p-3 bg-card rounded-lg border transition-all duration-200 ${
              isSelected 
                ? "border-primary/50 bg-primary/5" 
                : "border-card-border hover:shadow-sm hover:border-sidebar-border"
            }`}
          >
            {onToggleSelect && (
              <div 
                className={`shrink-0 transition-all duration-200 ${
                  hasSelection || isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
                style={{ visibility: hasSelection || isSelected ? "visible" : undefined }}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onToggleSelect(link.id)}
                  data-testid={`checkbox-select-${link.id}`}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            )}
            <div className="w-10 h-10 rounded-md bg-secondary/50 flex items-center justify-center shrink-0 border border-border/50 self-start mt-0.5">
              <img 
                src={getFavicon(link.url)} 
                alt="" 
                className="w-5 h-5 opacity-80"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
                }}
              />
            </div>
            
            <div className="min-w-0 flex-1 flex flex-col justify-center">
              <div className="flex items-baseline gap-2">
                <h3 className="font-medium text-foreground leading-none truncate">
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:underline decoration-1 underline-offset-2" onClick={handleLinkClick}>
                    {link.title}
                  </a>
                </h3>
                <span className="text-[10px] text-muted-foreground font-mono truncate opacity-60 shrink-0">
                  {getHostname(link.url)}
                </span>
              </div>
              
              {link.note ? (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1 opacity-90">
                  {link.note}
                </p>
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-[10px] text-muted-foreground opacity-50">
                    Added {formatDistanceToNow(link.createdAt, { addSuffix: true })}
                  </p>
                  {link.clickCount > 0 && (
                    <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground opacity-50" data-testid={`text-clicks-${link.id}`}>
                      <MousePointerClick size={10} />
                      {link.clickCount}
                    </span>
                  )}
                </div>
              )}
              {link.note && link.clickCount > 0 && (
                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground opacity-50 mt-0.5" data-testid={`text-clicks-${link.id}`}>
                  <MousePointerClick size={10} />
                  {link.clickCount}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button 
                onClick={() => onTogglePin(link.id)}
                className={`p-1.5 rounded-md transition-colors ${
                  link.isPinned 
                    ? "text-amber-500 hover:text-amber-600" 
                    : "text-muted-foreground hover:text-amber-500 opacity-0 group-hover:opacity-100"
                }`}
                title={link.isPinned ? "Unpin link" : "Pin link"}
                data-testid={`button-pin-${link.id}`}
              >
                <Star size={14} fill={link.isPinned ? "currentColor" : "none"} />
              </button>
              <a 
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors opacity-0 group-hover:opacity-100"
                title="Visit Link"
                onClick={handleLinkClick}
              >
                <ExternalLink size={14} />
              </a>
              <button 
                onClick={() => onDelete(link.id)}
                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                title="Delete link"
                data-testid={`button-delete-${link.id}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          Added on {format(link.createdAt, 'MMM d, yyyy \'at\' h:mm a')}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function LinkCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="relative flex items-center gap-3 p-3 bg-card rounded-lg border border-card-border"
    >
      <div className="w-10 h-10 rounded-md bg-secondary/50 animate-pulse shrink-0" />
      
      <div className="min-w-0 flex-1 flex flex-col justify-center gap-2">
        <div className="flex items-center gap-2">
          <div className="h-4 bg-secondary/50 rounded animate-pulse w-32" />
          <div className="h-3 bg-secondary/30 rounded animate-pulse w-20" />
        </div>
        <div className="h-3 bg-secondary/30 rounded animate-pulse w-24" />
      </div>
    </motion.div>
  );
}
