import type { CSSProperties, ReactNode } from "react";
import { Droplets, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  icon?: ReactNode;
  footer?: ReactNode;
  maxWidthClassName?: string;
  backgroundImageUrl?: string;
}

export default function AuthShell({
  title,
  subtitle,
  children,
  icon,
  footer,
  maxWidthClassName = "max-w-md",
  backgroundImageUrl,
}: AuthShellProps) {
  const { t } = useTranslation();
  const backgroundStyle: CSSProperties | undefined = backgroundImageUrl
    ? { backgroundImage: `url(${backgroundImageUrl})` }
    : undefined;

  return (
    <div
      className={`relative min-h-screen overflow-hidden bg-background px-4 py-8 ${
        backgroundImageUrl ? "bg-cover bg-center bg-no-repeat" : ""
      }`}
      style={backgroundStyle}
    >
      {backgroundImageUrl ? (
        <div className="pointer-events-none absolute inset-0 bg-slate-950/60" />
      ) : (
        <>
          <div className="pointer-events-none absolute -left-24 -top-20 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-danger/10 blur-3xl" />
        </>
      )}

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full items-center justify-center">
        <div className={`w-full ${maxWidthClassName}`}>
          <header className="mb-6 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/25">
                {icon ?? <Droplets className="h-7 w-7" />}
              </div>
            </div>
            <div
              className={`mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                backgroundImageUrl
                  ? "border-white/25 bg-white/15 text-white backdrop-blur"
                  : "border-primary/20 bg-primary/10 text-primary"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              {t("auth.portalBadge", "Secure Donor Portal")}
            </div>
            <h1
              className={`text-2xl font-bold ${
                backgroundImageUrl ? "text-white" : "text-text-primary"
              }`}
            >
              {title}
            </h1>
            <p
              className={`mx-auto mt-2 max-w-sm text-sm ${
                backgroundImageUrl ? "text-white/85" : "text-text-secondary"
              }`}
            >
              {subtitle}
            </p>
          </header>

          <section
            className={`blood-card border-border/80 shadow-xl ${
              backgroundImageUrl ? "bg-card/95 backdrop-blur-md" : ""
            }`}
          >
            {children}
          </section>

          {footer ? (
            <footer
              className={`mt-6 text-center text-xs ${
                backgroundImageUrl ? "text-white/80" : "text-text-secondary"
              }`}
            >
              {footer}
            </footer>
          ) : null}
        </div>
      </div>
    </div>
  );
}
