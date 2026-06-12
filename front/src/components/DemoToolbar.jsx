import { useEffect, useState } from "react";
import { getCurrentMember, updateDemoAuthorRole } from "@/api/authApi";

const STORAGE_KEYS = {
  darkMode: "demo-dark-mode",
};

function readSetting(key) {
  return window.localStorage.getItem(key) === "true";
}

function emitDemoChange(settings) {
  window.dispatchEvent(new CustomEvent("demo-settings-change", { detail: settings }));
}

export function emitMemberChange(member) {
  window.dispatchEvent(new CustomEvent("member-state-change", { detail: { member } }));
}

function DemoToolbar() {
  const [member, setMember] = useState(null);
  const [loadingMember, setLoadingMember] = useState(true);
  const [updatingRole, setUpdatingRole] = useState(false);
  const [darkMode, setDarkMode] = useState(() => readSetting(STORAGE_KEYS.darkMode));

  useEffect(() => {
    document.body.classList.toggle("theme-dark", darkMode);
    window.localStorage.setItem(STORAGE_KEYS.darkMode, String(darkMode));
    emitDemoChange({ darkMode });
  }, [darkMode]);

  useEffect(() => {
    async function loadMember() {
      try {
        const currentMember = await getCurrentMember();
        setMember(currentMember);
        emitMemberChange(currentMember);
      } catch {
        setMember(null);
        emitMemberChange(null);
      } finally {
        setLoadingMember(false);
      }
    }

    const handleMemberChange = (event) => {
      setMember(event.detail?.member ?? null);
      setLoadingMember(false);
    };

    loadMember();
    window.addEventListener("focus", loadMember);
    window.addEventListener("member-state-change", handleMemberChange);

    return () => {
      window.removeEventListener("focus", loadMember);
      window.removeEventListener("member-state-change", handleMemberChange);
    };
  }, []);

  const handleAuthorToggle = async (event) => {
    const authorEnabled = event.target.checked;
    try {
      setUpdatingRole(true);
      const updatedMember = await updateDemoAuthorRole(authorEnabled);
      setMember(updatedMember);
      emitMemberChange(updatedMember);
    } finally {
      setUpdatingRole(false);
    }
  };

  const isAuthor = member?.role === "AUTHOR" || member?.role === "ADMIN";
  const canToggleRole = Boolean(member) && member.role !== "ADMIN";

  return (
    <aside className="demo-toolbar" aria-label="시연 도구">
      <strong>DEMO</strong>
      <label className="demo-switch">
        <input
          type="checkbox"
          checked={isAuthor}
          disabled={!canToggleRole || loadingMember || updatingRole}
          onChange={handleAuthorToggle}
        />
        <span>저자 화면</span>
      </label>
      <label className="demo-switch">
        <input
          type="checkbox"
          checked={darkMode}
          onChange={(event) => setDarkMode(event.target.checked)}
        />
        <span>다크모드</span>
      </label>
      {!member && <small>로그인 후 역할 전환</small>}
    </aside>
  );
}

export default DemoToolbar;
