import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type FaqItem = Tables<"faq_items">;

export function useFaqItems() {
  return useQuery({
    queryKey: ["faq"],
    queryFn: async () => {
      const { data, error } = await supabase.from("faq_items").select("*").order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSendContactMessage() {
  return useMutation({
    mutationFn: async (v: { name: string; email: string; subject: string; message: string }) => {
      const { error } = await supabase.from("contact_messages").insert({
        name: v.name.trim(),
        email: v.email.trim(),
        subject: v.subject,
        message: v.message.trim(),
      });
      if (error) throw error;
    },
  });
}
