import { useState, useRef, useEffect, type MouseEvent as ReactMouseEvent } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronDown, type LucideIcon } from "lucide-react";
import { useSidebarState, type SubNavItem } from "./useSidebarState";

export interface SidebarItemProps {
  path: string;
  label: string;
  icon: LucideIcon;
  badge?: number | string;
  subItems?: SubNavItem[];
  divider?: boolean;
}

/**
 * Sidebar Navigation Item
 * Main navigation item with optional collapsible sub-items
 */
export default function SidebarItem({
  path,
  label,
  icon: Icon,
  badge,
  subItems,
  divider = false,
}: SidebarItemProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const { isCollapsed, expandedItems, toggleItem, closeMobile } =
    useSidebarState();
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);
  const flyoutRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLAnchorElement>(null);

  const hasSubItems = Boolean(subItems?.length);
  const isExpanded = expandedItems.includes(path);
  const translatedLabel = t(
    `mis.nav.${label.toLowerCase().replace(/\s+/g, "")}`,
    label
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        flyoutRef.current &&
        triggerRef.current &&
        !flyoutRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsFlyoutOpen(false);
      }
    };

    if (isFlyoutOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isFlyoutOpen]);

  useEffect(() => {
    setIsFlyoutOpen(false);
  }, [location.pathname, isCollapsed]);

  const handleToggle = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    if (hasSubItems) {
      event.preventDefault();

      if (isCollapsed) {
        setIsFlyoutOpen((current) => !current);
      } else {
        toggleItem(path);
      }

      return;
    }

    closeMobile();
  };

  return (
    <>
      <li className="relative">
        <NavLink
          ref={triggerRef}
          to={hasSubItems ? "#" : path}
          end={path === "/"}
          onClick={handleToggle}
          title={isCollapsed ? translatedLabel : undefined}
          className={({ isActive }) =>
            `group relative flex items-center overflow-hidden rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
              isCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"
            } ${
              (isActive && !hasSubItems) ||
              (!isCollapsed && hasSubItems && isExpanded)
                ? "bg-primary/10 text-primary shadow-sm shadow-primary/15"
                : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
            }`
          }
        >
          {({ isActive }) => (
            <>
              {((isActive && !hasSubItems) ||
                (!isCollapsed && hasSubItems && isExpanded)) && (
                <div className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
              )}

              <Icon
                className={`h-5 w-5 shrink-0 ${
                  (isActive && !hasSubItems) ||
                  (!isCollapsed && hasSubItems && isExpanded)
                    ? "text-primary"
                    : "text-text-secondary group-hover:text-text-primary"
                }`}
              />

              {!isCollapsed && (
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {translatedLabel}
                </span>
              )}

              {!isCollapsed && badge !== undefined && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary/10 px-1.5 text-[11px] font-semibold text-primary">
                  {badge}
                </span>
              )}

              {!isCollapsed && hasSubItems && (
                <span
                  className={`transition-transform duration-200 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                >
                  <ChevronDown className="h-4 w-4" />
                </span>
              )}
            </>
          )}
        </NavLink>

        {isCollapsed && hasSubItems && isFlyoutOpen && (
          <div
            ref={flyoutRef}
            className="absolute left-full top-0 z-50 ml-2 w-56 rounded-xl border border-border bg-card p-2 shadow-2xl"
          >
            <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
              {translatedLabel}
            </p>
            <ul className="space-y-1">
              {(subItems ?? []).map((subItem) => (
                <li key={subItem.id}>
                  <NavLink
                    to={subItem.path}
                    onClick={() => {
                      setIsFlyoutOpen(false);
                      closeMobile();
                    }}
                    className={({ isActive }) =>
                      `flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150 ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                      }`
                    }
                  >
                    {subItem.icon ? (
                      <subItem.icon className="h-3.5 w-3.5 shrink-0" />
                    ) : null}
                    <span className="flex-1 truncate">
                      {t(
                        `mis.nav.${subItem.label.toLowerCase().replace(/\s+/g, "")}`,
                        subItem.label
                      )}
                    </span>
                    {subItem.quickAction && (
                      <span className="rounded-full bg-success-soft px-1.5 py-0.5 text-[10px] font-semibold text-success">
                        Quick
                      </span>
                    )}
                  </NavLink>
                  {subItem.children?.length ? (
                    <ul className="ml-5 mt-1 space-y-0.5 border-l border-border pl-2">
                      {subItem.children.map((child) => (
                        <li key={child.id}>
                          <NavLink
                            to={child.path}
                            onClick={() => {
                              setIsFlyoutOpen(false);
                              closeMobile();
                            }}
                            className={({ isActive }) =>
                              `flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-all duration-150 ${
                                isActive
                                  ? "font-semibold text-primary"
                                  : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                              }`
                            }
                          >
                            <span className="h-1 w-1 rounded-full bg-current" />
                            <span>
                              {t(
                                `mis.nav.${child.label
                                  .toLowerCase()
                                  .replace(/\s+/g, "")}`,
                                child.label
                              )}
                            </span>
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!isCollapsed && hasSubItems && isExpanded && (
          <ul className="ml-4 mt-1 space-y-1 border-l border-border py-1 pl-4">
            {(subItems ?? []).map((subItem) => (
              <li key={subItem.id}>
                <NavLink
                  to={subItem.path}
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                    }`
                  }
                >
                  {subItem.icon ? (
                    <subItem.icon className="h-3.5 w-3.5 shrink-0" />
                  ) : null}
                  <span className="flex-1 truncate">
                    {t(
                      `mis.nav.${subItem.label.toLowerCase().replace(/\s+/g, "")}`,
                      subItem.label
                    )}
                  </span>
                  {subItem.quickAction && (
                    <span className="rounded-full bg-success-soft px-1.5 py-0.5 text-[10px] font-semibold text-success">
                      Quick
                    </span>
                  )}
                </NavLink>

                {subItem.children?.length ? (
                  <ul className="ml-3 mt-1 space-y-0.5 border-l border-border pl-3">
                    {subItem.children.map((child) => (
                      <li key={child.id}>
                        <NavLink
                          to={child.path}
                          onClick={closeMobile}
                          className={({ isActive }) =>
                            `flex items-center gap-2 rounded-md px-3 py-1.5 text-xs transition-all duration-150 ${
                              isActive
                                ? "font-semibold text-primary"
                                : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                            }`
                          }
                        >
                          <span className="h-1 w-1 rounded-full bg-current" />
                          <span>
                            {t(
                              `mis.nav.${child.label
                                .toLowerCase()
                                .replace(/\s+/g, "")}`,
                              child.label
                            )}
                          </span>
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </li>

      {divider ? (
        <li className={isCollapsed ? "px-2 py-2" : "px-3 py-2"}>
          <div className="h-px bg-border" />
        </li>
      ) : null}
    </>
  );
}
