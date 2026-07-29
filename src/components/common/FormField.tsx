import { forwardRef, type InputHTMLAttributes } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, id, className, ...rest }, ref) => {
    const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={fieldId} className="label-tag">
          {label}
        </label>
        <input
          id={fieldId}
          ref={ref}
          className={`field-input ${error ? "field-error" : ""} ${className ?? ""}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          {...rest}
        />
        {error && (
          <p id={`${fieldId}-error`} className="text-sm text-danger">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";
