"use client";

import { Modal } from "@carbon/react";

interface ConfirmDeleteModalProps {
  open: boolean;
  heading: string;
  children: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDeleteModal({
  open,
  heading,
  children,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  return (
    <Modal
      open={open}
      danger
      modalHeading={heading}
      primaryButtonText="Delete"
      secondaryButtonText="Cancel"
      onRequestClose={onCancel}
      onRequestSubmit={onConfirm}
    >
      {children}
    </Modal>
  );
}
