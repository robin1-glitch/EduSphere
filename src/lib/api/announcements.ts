import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Announcement = Tables<"announcements">;
const KEY = ["announcements"] as const;

export function useAnnouncements() {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useLatestAnnouncements(limit = 3) {
  return useQuery({
    queryKey: [...KEY, "latest", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSaveAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { id?: string; title: string; body: string; category: string; isPinned: boolean }) => {
      const row = { title: v.title.trim(), body: v.body.trim(), category: v.category, is_pinned: v.isPinned };
      const { error } = v.id
        ? await supabase.from("announcements").update(row).eq("id", v.id)
        : await supabase.from("announcements").insert(row);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("announcements").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
