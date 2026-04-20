import type { HTMLAttributes, ReactNode } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "error" | "danger" | "info" | "outline";
  size?: "sm" | "md" | "lg";
  dot?: boolean;
  icon?: ReactNode;
}

export default function Badge({
  variant = "default",
  size = "md",
  dot = false,
  icon,
  className = "",
  children,
  ...props
}: BadgeProps) {
  const baseStyles = "badge transition-colors";

  const variants = {
    default: "badge-neutral",
    primary: "badge-blood",
    secondary: "badge-neutral",
    success: "badge-success",
    warning: "badge-warning",
    error: "badge-blood",
    danger: "badge-blood",
    info: "border-info/20 bg-info-soft text-info",
    outline: "border-border bg-transparent text-text-primary hover:bg-surface",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  const dotColors = {
    default: "bg-text-muted",
    primary: "bg-danger",
    secondary: "bg-text-secondary",
    success: "bg-success",
    warning: "bg-warning",
    error: "bg-danger",
    danger: "bg-danger",
    info: "bg-info",
    outline: "bg-text-secondary",
  };

  return (
    <span
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${dotColors[variant]}`}
        />
      )}
      {icon}
      {children}
    </span>
  );
}
