interface FormActionsProps {
  isSubmitting: boolean;
  submitLabel: string;
  submittingLabel?: string;
  showCancel?: boolean;
  cancelLabel?: string;
  onCancel?: () => void;
}

export function FormActions({
  isSubmitting,
  submitLabel,
  submittingLabel = "Salvando...",
  showCancel = false,
  cancelLabel = "Cancelar",
  onCancel,
}: FormActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button type="submit" disabled={isSubmitting} className="btn-primary">
        {isSubmitting ? submittingLabel : submitLabel}
      </button>

      {showCancel && onCancel && (
        <button type="button" onClick={onCancel} className="btn-secondary">
          {cancelLabel}
        </button>
      )}
    </div>
  );
}
