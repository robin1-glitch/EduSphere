import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import type { ReviewStatus } from "@/lib/constants";

export type Review = Tables<"reviews">;
const KEY = ["reviews"] as const;

export function useReviews() {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const { data, error } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** Postgres unique violation → friendly message for "one review per user per course". */
export function reviewErrorMessage(err: unknown) {
  const code = (err as { code?: string } | null)?.code;
  if (code === "23505") return "You've already reviewed this course. Edit your existing review instead.";
  return "We couldn't save your review. Please try again.";
}

export function useSaveReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { id?: string; courseName: string; rating: number; comment: string; authorName: string }) => {
      const row = { course_name: v.courseName, rating: v.rating, comment: v.comment.trim() };
      const { error } = v.id
        ? await supabase.from("reviews").update({ ...row, status: "Pending" }).eq("id", v.id)
        : await supabase.from("reviews").insert({ ...row, author_name: v.authorName, status: "Pending" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useSetReviewStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { id: string; status: ReviewStatus }) => {
      const { error } = await supabase.from("reviews").update({ status: v.status }).eq("id", v.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
