import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
}

export function FormField({ label, error, children }: FormFieldProps) {
  return (
    <label className="grid gap-1">
      <span className="text-sm font-medium text-[#240D49]">{label}</span>
      {children}
      {error && <small className="text-red-600">{error}</small>}
    </label>
  );
}
