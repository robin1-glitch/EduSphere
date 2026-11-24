import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./Button";

type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string | undefined;
  size?: "md" | "sm" | undefined;
  children: ReactNode;
  footer?: ReactNode | undefined;
};

export function Modal({ open, onOpenChange, title, description, size = "md", children, footer }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="es-overlay" />
        <Dialog.Content
          className={`es-modal${size === "sm" ? " es-modal--sm" : ""}`}
          {...(description ? {} : { "aria-describedby": undefined })}
        >
          <div className="es-modal__head">
            <div>
              <Dialog.Title className="es-modal__title">{title}</Dialog.Title>
              {description ? <Dialog.Description className="es-modal__desc">{description}</Dialog.Description> : null}
            </div>
            <Dialog.Close asChild>
              <button type="button" className="es-btn es-btn--ghost es-btn--sm es-btn--icon" aria-label="Close dialog">
                <X aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>
          {children}
          {footer ? <div className="es-modal__foot">{footer}</div> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

type ConfirmProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  loading?: boolean | undefined;
  tone?: "danger" | "primary" | undefined;
};

export function ConfirmModal({ open, onOpenChange, title, description, confirmLabel, onConfirm, loading, tone = "danger" }: ConfirmProps) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant={tone} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {null}
    </Modal>
  );
}
