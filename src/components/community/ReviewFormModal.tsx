import { useEffect, useId, useState, type FormEvent } from "react";
import { AlertCircle } from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { SelectField, TextAreaField } from "@/components/common/FormField";
import { StarRatingInput } from "@/components/common/StarRating";
import { COURSE_NAMES } from "@/lib/constants";
import { LIMITS, hasErrors, validateReview } from "@/lib/validation";

export type ReviewFormValues = { courseName: string; rating: number; comment: string };
type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  mode: "create" | "edit";
  initial?: ReviewFormValues | undefined;
  reviewedCourses: string[];
  loading?: boolean | undefined;
  serverError?: string | null | undefined;
  onSubmit: (v: ReviewFormValues) => void;
};
const EMPTY: ReviewFormValues = { courseName: "", rating: 0, comment: "" };

export function ReviewFormModal({ open, onOpenChange, mode, initial, reviewedCourses, loading, serverError, onSubmit }: Props) {
  const [values, setValues] = useState(initial ?? EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof ReviewFormValues, string>>>({});
  const ratingErrId = useId();

  useEffect(() => {
    if (open) {
      setValues(initial ?? EMPTY);
      setErrors({});
    }
  }, [open, initial]);

  const validate = (v: ReviewFormValues) => {
    const errs = validateReview(v);
    if (mode === "create" && v.courseName && reviewedCourses.includes(v.courseName)) {
      errs.courseName = "You've already reviewed this course. You can edit your existing review instead.";
    }
    return errs;
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validate(values);
    setErrors(errs);
    if (hasErrors(errs)) return;
    onSubmit(values);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={mode === "create" ? "Write a review" : "Edit your review"} description="Reviews are checked by an admin before they appear publicly.">
      <form className="es-form" onSubmit={submit} noValidate>
        {mode === "create" ? (
          <SelectField label="Course" name="courseName" required options={COURSE_NAMES} placeholder="Choose a course" value={values.courseName} onChange={(e) => setValues({ ...values, courseName: e.target.value })} error={errors.courseName} />
        ) : (
          <p className="es-help">Course: <strong>{values.courseName}</strong></p>
        )}
        <div>
          <StarRatingInput name="review-rating" value={values.rating} onChange={(rating) => setValues({ ...values, rating })} error={errors.rating} describedBy={errors.rating ? ratingErrId : undefined} />
          {errors.rating ? <p id={ratingErrId} className="es-error"><AlertCircle aria-hidden="true" />{errors.rating}</p> : null}
        </div>
        <TextAreaField label="Comment" name="comment" required value={values.comment} onChange={(e) => setValues({ ...values, comment: e.target.value })} error={errors.comment} maxLength={LIMITS.reviewComment.max} help={`At least ${LIMITS.reviewComment.min} characters. What did you like? What could be better?`} rows={5} />
        {serverError ? <p className="es-error" role="alert"><AlertCircle aria-hidden="true" />{serverError}</p> : null}
        <div className="es-modal__foot">
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button type="submit" loading={loading}>{mode === "create" ? "Submit review" : "Save review"}</Button>
        </div>
      </form>
    </Modal>
  );
}
