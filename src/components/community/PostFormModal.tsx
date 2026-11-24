import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { SelectField, TextAreaField, TextField } from "@/components/common/FormField";
import { FORUM_CATEGORIES } from "@/lib/constants";
import { LIMITS, hasErrors, validatePost } from "@/lib/validation";

export type PostFormValues = { title: string; category: string; content: string };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: PostFormValues | undefined;
  mode: "create" | "edit";
  loading?: boolean | undefined;
  onSubmit: (values: PostFormValues) => void;
};

const EMPTY: PostFormValues = { title: "", category: "", content: "" };

export function PostFormModal({ open, onOpenChange, initial, mode, loading, onSubmit }: Props) {
  const [values, setValues] = useState<PostFormValues>(initial ?? EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof PostFormValues, string>>>({});
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(initial ?? EMPTY);
      setErrors({});
      setTouched(false);
    }
  }, [open, initial]);

  const set = (key: keyof PostFormValues) => (e: { target: { value: string } }) => {
    const next = { ...values, [key]: e.target.value };
    setValues(next);
    if (touched) setErrors(validatePost(next));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    const errs = validatePost(values);
    setErrors(errs);
    if (hasErrors(errs)) return;
    onSubmit(values);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "create" ? "Start a discussion" : "Edit discussion"}
      description={mode === "create" ? "Ask a question or share something with other learners." : undefined}
    >
      <form className="es-form" onSubmit={submit} noValidate>
        <TextField label="Title" name="title" required value={values.title} onChange={set("title")} error={errors.title} maxLength={LIMITS.postTitle.max} placeholder="e.g. How do I stay motivated?" />
        <SelectField label="Category" name="category" required options={FORUM_CATEGORIES} placeholder="Choose a category" value={values.category} onChange={set("category")} error={errors.category} />
        <TextAreaField label="Content" name="content" required value={values.content} onChange={set("content")} error={errors.content} maxLength={LIMITS.postContent.max} help={`At least ${LIMITS.postContent.min} characters.`} rows={7} />
        <div className="es-modal__foot">
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button type="submit" loading={loading}>{mode === "create" ? "Publish post" : "Save changes"}</Button>
        </div>
      </form>
    </Modal>
  );
}
