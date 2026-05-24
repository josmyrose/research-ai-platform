import {
  FaArrowRightFromBracket,
  FaBookOpen,
  FaBolt,
  FaClockRotateLeft,
  FaCompass,
  FaDatabase,
  FaFlask,
  FaGlobe,
  FaGraduationCap,
  FaMagnifyingGlass,
  FaPlus,
  FaCircleUser,
} from "react-icons/fa6";

import { authStorage } from "../../../services/storageService";

const primaryItems = [
  { key: "search", icon: FaMagnifyingGlass, label: "Search" },
  { key: "history", icon: FaClockRotateLeft, label: "History" },
  { key: "navigator", icon: FaCompass, label: "Science Navigator" },
];

const libraryItems = [
  { key: "library", icon: FaBookOpen, label: "Library" },
  { key: "scholars", icon: FaGraduationCap, label: "Scholars" },
  { key: "sciencepedia", icon: FaGlobe, label: "SciencePedia" },
  { key: "knowledge", icon: FaDatabase, label: "Knowledge Base" },
  { key: "practice", icon: FaFlask, label: "Practice" },
];

function NavButton({ item, activeSection, onSectionChange }) {
  const Icon = item.icon;
  const isActive = activeSection === item.key;

  return (
    <button
      onClick={() => onSectionChange(item.key)}
      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium transition ${
        isActive
          ? "bg-[linear-gradient(135deg,rgba(76,105,237,0.16),rgba(255,255,255,0.86))] text-slate-900 shadow-sm"
          : "text-slate-600 hover:bg-white/70 hover:text-slate-900"
      }`}
    >
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-sm ${
          isActive ? "bg-[#4968eb] text-white" : "bg-white/80 text-[#4a66e8]"
        }`}
      >
        <Icon />
      </span>
      <span>{item.label}</span>
    </button>
  );
}

export default function Sidebar({ activeSection, onSectionChange, onNewChat, currentUser }) {
  const handleLogout = () => {
    authStorage.clearSession();
    window.location.href = "/";
  };

  return (
    <aside className="flex h-full w-full max-w-[290px] flex-col rounded-[32px] border border-white/55 bg-white/55 p-5 shadow-[0_28px_70px_rgba(114,135,198,0.16)] backdrop-blur-2xl">
      <div>
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#c8d3ff] bg-[#eef2ff] text-lg font-semibold text-[#3156d3] shadow-sm">
            Rx
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-800">Research AI</p>
            <p className="text-sm text-slate-500">Scientific workspace</p>
          </div>
        </div>

        <button
          onClick={onNewChat}
          className="mb-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-[#4968eb] px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(73,104,235,0.28)] transition hover:-translate-y-0.5 hover:bg-[#3f5bdd]"
        >
          <FaPlus className="text-xs" />
          New Chat
        </button>

        <div className="space-y-2">
          {primaryItems.map((item) => (
            <NavButton
              key={item.key}
              item={item}
              activeSection={activeSection}
              onSectionChange={onSectionChange}
            />
          ))}
        </div>

        <div className="my-6 h-px bg-slate-200/80" />

        <div className="mb-3 flex items-center justify-between px-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Discovery
          </p>
          <FaBolt className="text-xs text-[#6f87ef]" />
        </div>

        <div className="space-y-2">
          {libraryItems.map((item) => (
            <NavButton
              key={item.key}
              item={item}
              activeSection={activeSection}
              onSectionChange={onSectionChange}
            />
          ))}
        </div>

        <div className="mt-8 rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,rgba(86,111,236,0.14),rgba(255,255,255,0.8))] p-4 shadow-[0_18px_34px_rgba(131,152,214,0.16)]">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#4968eb] text-white shadow-md">
              <FaBolt />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Pro Research</p>
              <p className="text-xs text-slate-500">Deeper analysis with citations</p>
            </div>
          </div>
          <button
            onClick={() => onSectionChange("knowledge")}
            className="w-full rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-[#4562e1] shadow-sm transition hover:bg-slate-50"
          >
            Open Knowledge Base
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {currentUser && (
          <div className="rounded-[24px] border border-white/75 bg-white/75 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#4968eb]">
                <FaCircleUser />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Signed in as
                </p>
                <p className="truncate text-sm font-semibold text-slate-800">{currentUser}</p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => onSectionChange("history")}
          className="w-full rounded-[24px] border border-white/70 bg-white/70 p-4 text-left shadow-sm transition hover:bg-white/80"
        >
          <div className="mb-3 flex items-center gap-3 text-slate-700">
            <FaClockRotateLeft className="text-[#4b67e9]" />
            <span className="text-sm font-semibold">Recent session</span>
          </div>
          <p className="text-sm leading-6 text-slate-500">
            Review your saved questions and answers for this login.
          </p>
        </button>

        <div className="flex items-center justify-between text-sm text-slate-500">
          <button className="rounded-full border border-white/80 bg-white/80 px-3 py-2 transition hover:bg-white">
            English (EN)
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 py-2 font-semibold text-slate-700 transition hover:bg-white"
          >
            <FaArrowRightFromBracket className="text-xs" />
            Log out
          </button>
        </div>
      </div>
    </aside>
  );
}
