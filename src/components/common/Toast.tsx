import { Toaster as Sonner, toast } from "sonner";
import { CheckCircle2, AlertCircle } from "lucide-react";

/** Short, clear toasts in the bottom corner so they never cover primary controls. */
export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      duration={4000}
      visibleToasts={3}
      toastOptions={{
        unstyled: true,
        classNames: { toast: "es-toast", title: "es-toast__title", description: "es-toast__desc" },
      }}
      icons={{ success: <CheckCircle2 aria-hidden="true" size={18} />, error: <AlertCircle aria-hidden="true" size={18} /> }}
    />
  );
}

export const notify = {
  success: (title: string, description?: string) => toast.success(title, description ? { description } : undefined),
  error: (title: string, description?: string) => toast.error(title, description ? { description } : undefined),
};
