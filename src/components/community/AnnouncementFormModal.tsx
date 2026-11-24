import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { SelectField, TextAreaField, TextField } from "@/components/common/FormField";
import { ANNOUNCEMENT_CATEGORIES } from "@/lib/constants";
import { LIMITS, hasErrors, validateAnnouncement } from "@/lib/validation";

export type AnnouncementFormValues = { title: string; category: string; body: string; isPinned: boolean };
const EMPTY: AnnouncementFormValues = { title: "", category: "", body: "", isPinned: false };

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial?: AnnouncementFormValues | undefined;
  loading?: boolean | undefined;
  onSubmit: (v: AnnouncementFormValues) => void;
};

export function AnnouncementFormModal({ open, onOpenChange, initial, loading, onSubmit }: Props) {
  const [values, setValues] = useState(initial ?? EMPTY);
  const [errors, setErrors] = useState<Partial<Record<"title" | "category" | "body", string>>>({});

  useEffect(() => {
    if (open) {
      setValues(initial ?? EMPTY);
      setErrors({});
    }
  }, [open, initial]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validateAnnouncement(values);
    setErrors(errs);
    if (hasErrors(errs)) return;
    onSubmit(values);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={initial ? "Edit announcement" : "Add announcement"}>
      <form className="es-form" onSubmit={submit} noValidate>
        <TextField label="Title" name="title" required value={values.title} onChange={(e) => setValues({ ...values, title: e.target.value })} error={errors.title} maxLength={LIMITS.announcementTitle.max} />
        <SelectField label="Category" name="category" required options={ANNOUNCEMENT_CATEGORIES} placeholder="Choose a category" value={values.category} onChange={(e) => setValues({ ...values, category: e.target.value })} error={errors.category} />
        <TextAreaField label="Body" name="body" required value={values.body} onChange={(e) => setValues({ ...values, body: e.target.value })} error={errors.body} maxLength={LIMITS.announcementBody.max} rows={6} />
        <label className="es-row">
          <input type="checkbox" checked={values.isPinned} onChange={(e) => setValues({ ...values, isPinned: e.target.checked })} className="community-checkbox" />
          <span className="es-label">Pin to the top of the list</span>
        </label>
        <div className="es-modal__foot">
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button type="submit" loading={loading}>{initial ? "Save changes" : "Publish announcement"}</Button>
        </div>
      </form>
    </Modal>
  );
}
