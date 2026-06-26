import { forwardRef, type InputHTMLAttributes } from "react";

export interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, description, className = "", ...props }, ref) => {
    return (
      <div className={`toggle-container items-start ${className}`}>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            ref={ref}
            type="checkbox"
            className="toggle-input"
            aria-label={props["aria-label"] ?? label}
            {...props}
          />
          <div className="toggle-switch">
            <span className="toggle-thumb" />
          </div>
        </label>
        {(label || description) && (
          <div className="flex flex-col gap-0.5">
            {label && (
              <span className="text-sm font-medium text-text-primary">
                {label}
              </span>
            )}
            {description && (
              <span className="text-xs text-text-secondary">{description}</span>
            )}
          </div>
        )}
      </div>
    );
  }
);

Switch.displayName = "Switch";

export default Switch;
