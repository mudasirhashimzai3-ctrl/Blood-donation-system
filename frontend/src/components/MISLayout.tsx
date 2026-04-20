import { Outlet } from "react-router-dom";
import { Sidebar } from "./sidebar";
import MISHeader from "./MISHeader";
import { SessionTimeoutModal } from "@/modules/auth";
import { useSessionTimeout } from "@/modules/auth";
import { useSessionStore } from "@/modules/auth";

export default function MISLayout() {
  const { keepAlive, remainingTime } = useSessionTimeout();
  const { showTimeoutWarning, hideWarning } = useSessionStore();

  return (
    <div
      data-section="mis"
      className="h-screen overflow-hidden bg-background text-text-primary"
    >
      <div className="relative flex h-full">
        <Sidebar />
        <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
          <MISHeader />
          <main className="flex-1 overflow-y-auto bg-background px-4 pb-6 pt-4 sm:px-6 sm:pb-8 sm:pt-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1680px] animate-fade-in">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      <SessionTimeoutModal
        isOpen={showTimeoutWarning}
        remainingSeconds={Math.floor(remainingTime / 1000)}
        onKeepAlive={() => {
          keepAlive();
          hideWarning();
        }}
      />
    </div>
  );
}
