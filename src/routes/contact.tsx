import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { Card } from "@/components/common/Card";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/common/Button";
import { SelectField, TextAreaField, TextField } from "@/components/common/FormField";
import { notify } from "@/components/common/Toast";
import { CONTACT_DETAILS } from "@/components/layout/Footer";
import { useSendContactMessage } from "@/lib/api/public";
import { CONTACT_SUBJECTS } from "@/lib/constants";
import { LIMITS, hasErrors, validateContact } from "@/lib/validation";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact EduSphere — We're here to help" },
      { name: "description", content: "Get in touch with the EduSphere support team by email, phone or the contact form." },
      { property: "og:title", content: "Contact EduSphere — We're here to help" },
      { property: "og:description", content: "Questions about courses, your account or partnerships? Send us a message." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ContactPage,
});

const EMPTY = { name: "", email: "", subject: "", message: "" };
type Values = typeof EMPTY;

function ContactPage() {
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const send = useSendContactMessage();

  const set = (key: keyof Values) => (e: { target: { value: string } }) => {
    const next = { ...values, [key]: e.target.value };
    setValues(next);
    if (submitted) setErrors(validateContact(next));
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const errs = validateContact(values);
    setErrors(errs);
    if (hasErrors(errs)) {
      const first = (Object.keys(errs) as (keyof Values)[])[0];
      document.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    send.mutate(values, {
      onSuccess: () => {
        notify.success("Message sent", "Thanks! We'll reply within one working day.");
        setValues(EMPTY);
        setErrors({});
        setSubmitted(false);
      },
      onError: () => notify.error("Message not sent", "Please check your connection and try again."),
    });
  };

  const info = [
    { icon: Mail, label: "Email", value: CONTACT_DETAILS.email, href: `mailto:${CONTACT_DETAILS.email}` },
    { icon: Phone, label: "Phone", value: CONTACT_DETAILS.phone, href: "tel:+97715550123" },
    { icon: MapPin, label: "Address", value: CONTACT_DETAILS.address },
    { icon: Clock, label: "Support hours", value: CONTACT_DETAILS.hours },
  ];

  return (
    <div className="es-container es-page">
      <PageHeader eyebrow="Contact" title="We're here to help" lead="Questions about a course, your account or working with us? Send a message and we'll get back to you." />
      <div className="es-grid-12">
        <Card as="aside" className="es-span-5 community-contact-info" aria-labelledby="contact-details-title">
          <h2 id="contact-details-title" className="es-section__title">Contact details</h2>
          <ul className="community-contact-info__list">
            {info.map(({ icon: Icon, label, value, href }) => (
              <li key={label} className="community-contact-info__item">
                <span className="community-contact-info__icon" aria-hidden="true"><Icon /></span>
                <div>
                  <p className="community-contact-info__label">{label}</p>
                  {href ? <a className="es-link community-contact-info__value" href={href}>{value}</a> : <p className="community-contact-info__value">{value}</p>}
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card as="section" className="es-span-7" aria-labelledby="contact-form-title">
          <h2 id="contact-form-title" className="es-section__title">Send us a message</h2>
          <p className="es-help">Fields marked * are required.</p>
          <form className="es-form" onSubmit={onSubmit} noValidate>
            <div className="es-form__row es-form__row--2">
              <TextField label="Full name" name="name" required autoComplete="name" value={values.name} onChange={set("name")} error={errors.name} maxLength={LIMITS.contactName.max} />
              <TextField label="Email" name="email" type="email" required autoComplete="email" value={values.email} onChange={set("email")} error={errors.email} />
            </div>
            <SelectField label="Subject" name="subject" required options={CONTACT_SUBJECTS} placeholder="Choose a subject" value={values.subject} onChange={set("subject")} error={errors.subject} />
            <TextAreaField label="Message" name="message" required value={values.message} onChange={set("message")} error={errors.message} help={`At least ${LIMITS.contactMessage.min} characters.`} maxLength={LIMITS.contactMessage.max} rows={6} />
            <div className="es-row es-row--end">
              <Button type="submit" loading={send.isPending}>
                {send.isPending ? null : <Send aria-hidden="true" />} Send message
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
