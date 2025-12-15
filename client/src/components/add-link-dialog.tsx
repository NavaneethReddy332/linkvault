import { useVault } from "@/lib/store";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const normalizeUrl = (url: string): string => {
  let normalized = url.trim();
  if (!normalized.match(/^https?:\/\//i)) {
    normalized = 'https://' + normalized;
  }
  return normalized;
};

const isValidUrl = (url: string): boolean => {
  try {
    const normalized = normalizeUrl(url);
    new URL(normalized);
    const domainPattern = /^https?:\/\/[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}/;
    return domainPattern.test(normalized);
  } catch {
    return false;
  }
};

const formSchema = z.object({
  url: z.string().min(1, "URL is required").refine(isValidUrl, "Please enter a valid URL (e.g., chatgpt.com or https://chatgpt.com)"),
  title: z.string().min(1, "Title is required"),
  groupId: z.string().min(1, "Please select a section"),
  note: z.string().optional(),
});

export function AddLinkDialog() {
  const { addLink, groups, activeGroupId, user, setShowAuthModal } = useVault();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      title: "",
      groupId: activeGroupId === 'all' ? (groups[0]?.id || "") : activeGroupId,
      note: "",
    },
  });

  function handleOpenChange(newOpen: boolean) {
    if (newOpen && !user) {
      setShowAuthModal(true);
      return;
    }
    setOpen(newOpen);
    if (newOpen) {
      form.reset({
        url: "",
        title: "",
        groupId: activeGroupId === 'all' ? (groups[0]?.id || "") : activeGroupId,
        note: "",
      });
    }
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    const normalizedUrl = normalizeUrl(values.url);
    addLink({
      url: normalizedUrl,
      title: values.title,
      groupId: values.groupId,
      note: values.note || undefined,
    });
    form.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          data-testid="button-add-link"
          className="rounded-full shadow-lg bg-foreground text-background hover:bg-foreground/90 transition-all active:scale-95"
        >
          <Plus size={18} className="mr-2" /> Add Link
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border-border/50 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-display font-medium">Save a new link</DialogTitle>
          <DialogDescription className="text-muted-foreground">Add a link to your vault for easy access later.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input data-testid="input-url" placeholder="chatgpt.com or https://..." {...field} className="font-mono text-sm bg-secondary/30 border-transparent focus:border-border focus:bg-background transition-all" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input data-testid="input-title" placeholder="What is this?" {...field} className="bg-secondary/30 border-transparent focus:border-border focus:bg-background transition-all" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="groupId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Section</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-group" className="bg-secondary/30 border-transparent focus:border-border focus:bg-background transition-all">
                        <SelectValue placeholder="Select a section" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      data-testid="input-note"
                      placeholder="Why are you saving this?" 
                      className="resize-none bg-secondary/30 border-transparent focus:border-border focus:bg-background transition-all" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" data-testid="button-submit-link">Save Link</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
