import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesUpdate } from "@/integrations/supabase/types";
import { FORUM_PAGE_SIZE } from "@/lib/constants";
import { sanitizeSearch } from "@/lib/validation";

export type ForumPost = Tables<"forum_posts">;
export type ForumReply = Tables<"forum_replies">;
export type PostSort = "newest" | "replies";

export type PostListParams = {
  q: string;
  category: string;
  sort: PostSort;
  page: number;
  includeHidden: boolean;
};

export const forumKeys = {
  all: ["forum"] as const,
  list: (p: PostListParams) => ["forum", "posts", p] as const,
  post: (id: string) => ["forum", "post", id] as const,
  replies: (id: string) => ["forum", "replies", id] as const,
};

export async function fetchPosts(p: PostListParams) {
  let query = supabase.from("forum_posts").select("*", { count: "exact" });
  if (!p.includeHidden) query = query.neq("status", "Hidden");
  if (p.category) query = query.eq("category", p.category);
  const q = sanitizeSearch(p.q);
  if (q) query = query.or(`title.ilike.%${q}%,content.ilike.%${q}%,author_name.ilike.%${q}%`);
  query = query.order("is_pinned", { ascending: false });
  query =
    p.sort === "replies"
      ? query.order("reply_count", { ascending: false }).order("created_at", { ascending: false })
      : query.order("created_at", { ascending: false });
  const from = (p.page - 1) * FORUM_PAGE_SIZE;
  const { data, error, count } = await query.range(from, from + FORUM_PAGE_SIZE - 1);
  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0 };
}

export function usePosts(p: PostListParams) {
  return useQuery({ queryKey: forumKeys.list(p), queryFn: () => fetchPosts(p), placeholderData: keepPreviousData });
}

export function usePost(id: string) {
  return useQuery({
    queryKey: forumKeys.post(id),
    queryFn: async () => {
      const { data, error } = await supabase.from("forum_posts").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useReplies(postId: string) {
  return useQuery({
    queryKey: forumKeys.replies(postId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_replies")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

function useInvalidateForum() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: forumKeys.all });
}

export function useCreatePost() {
  const invalidate = useInvalidateForum();
  return useMutation({
    mutationFn: async (v: { title: string; category: string; content: string; authorName: string }) => {
      const { data, error } = await supabase
        .from("forum_posts")
        .insert({ title: v.title.trim(), category: v.category, content: v.content.trim(), author_name: v.authorName })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: invalidate,
  });
}

export function useUpdatePost() {
  const invalidate = useInvalidateForum();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: TablesUpdate<"forum_posts"> }) => {
      const { data, error } = await supabase.from("forum_posts").update(patch).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: invalidate,
  });
}

export function useDeletePost() {
  const invalidate = useInvalidateForum();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("forum_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export function useCreateReply() {
  const invalidate = useInvalidateForum();
  return useMutation({
    mutationFn: async (v: { postId: string; content: string; authorName: string }) => {
      const { error } = await supabase
        .from("forum_replies")
        .insert({ post_id: v.postId, content: v.content.trim(), author_name: v.authorName });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export function useUpdateReply() {
  const invalidate = useInvalidateForum();
  return useMutation({
    mutationFn: async (v: { id: string; content: string }) => {
      const { error } = await supabase.from("forum_replies").update({ content: v.content.trim() }).eq("id", v.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export function useDeleteReply() {
  const invalidate = useInvalidateForum();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("forum_replies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}
