import { useEffect, useMemo, useState } from "react";
import {
  FaArrowUp,
  FaBookOpen,
  FaBolt,
  FaCirclePlus,
  FaFileArrowUp,
  FaFlask,
  FaPenNib,
  FaRocket,
  FaWandMagicSparkles,
} from "react-icons/fa6";

import { getChatHistory, sendChatMessage, uploadResearchFile } from "../../../services/researchService";
import { LoadingSkeleton } from "../../../ui";

const quickActions = [
  { icon: FaBolt, label: "General Q&A" },
  { icon: FaPenNib, label: "AI Writing" },
  { icon: FaBookOpen, label: "Lit Review" },
  { icon: FaWandMagicSparkles, label: "Generate Figure" },
];

const suggestions = [
  "Analyze the impact of human activities on wildlife from a macroecological perspective.",
  "How can we design catalysts for more efficient water splitting?",
  "What are the lipid requirements during the growth stage of banded prawns?",
  "How can interpretability improve trust in deep learning systems?",
];

const chatModes = [
  {
    key: "lite",
    icon: FaRocket,
    label: "Lite",
    helper: "Fast, concise answers from the closest document context.",
  },
  {
    key: "deep_review",
    icon: FaFlask,
    label: "Deep Review",
    helper: "Broader retrieval with findings, evidence, limits, and next steps.",
  },
  {
    key: "source_mode",
    icon: FaBookOpen,
    label: "Source Mode",
    helper: "Strictly grounded answers grouped by source.",
  },
];

const getModeLabel = (modeKey) =>
  chatModes.find((mode) => mode.key === modeKey)?.label ?? "Lite";

const handleUpload = async (file) => {
  if (!file) {
    return null;
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await uploadResearchFile(formData);
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.detail || "Upload failed");
  }
};

const mapHistoryToChat = (historyItems) =>
  historyItems
    .slice()
    .reverse()
    .flatMap((item) => [
      { type: "user", text: item.message, mode: item.mode },
      { type: "ai", text: item.response, mode: item.mode },
    ]);

export default function ChatBox({ resetSignal = 0 }) {
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [activeMode, setActiveMode] = useState("lite");

  const activeModeConfig = chatModes.find((mode) => mode.key === activeMode) ?? chatModes[0];

  useEffect(() => {
    let isMounted = true;

    const loadHistory = async () => {
      setHistoryLoading(true);

      try {
        const response = await getChatHistory();
        if (isMounted) {
          setChat(mapHistoryToChat(response.data ?? []));
        }
      } catch {
        if (isMounted) {
          setChat([]);
        }
      } finally {
        if (isMounted) {
          setHistoryLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (resetSignal > 0) {
      setChat([]);
      setMsg("");
    }
  }, [resetSignal]);

  const isEmpty = chat.length === 0;
  const helperText = useMemo(
    () =>
      isEmpty
        ? "Turn scattered papers and research questions into a guided scientific workflow."
        : "Continue refining your prompt, upload context, or branch into a fresh exploration.",
    [isEmpty],
  );

  const send = async (preset) => {
    const nextMessage = (preset ?? msg).trim();
    if (!nextMessage) {
      return;
    }

    setChat((prev) => [...prev, { type: "user", text: nextMessage, mode: activeMode }]);
    setMsg("");
    setLoading(true);

    try {
      const res = await sendChatMessage(nextMessage, activeMode);

      setChat((prev) => [
        ...prev,
        { type: "ai", text: res.data.response, mode: activeMode },
      ]);
    } catch (error) {
      const errorMessage =
        error.code === "ECONNABORTED"
          ? "The answer is taking too long. Check that Ollama is running and the selected model is installed, then try again."
          : error.response?.data?.detail ||
            "I couldn't reach the research assistant service. Please try again in a moment.";

      setChat((prev) => [
        ...prev,
        {
          type: "ai",
          text: errorMessage,
          mode: activeMode,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onUpload = async (file) => {
    if (!file) {
      return;
    }

    setUploading(true);

    try {
      const result = await handleUpload(file);
      setChat((prev) => [
        ...prev,
        {
          type: "ai",
          text: `Uploaded ${result.filename} (${result.page_count} pages, ${result.chunk_count} indexed chunks).\n\nSummary: ${result.summary}`,
          mode: activeMode,
        },
      ]);
    } catch (error) {
      setChat((prev) => [
        ...prev,
        {
          type: "ai",
          text: error.message,
          mode: activeMode,
        },
      ]);
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[36px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(242,246,255,0.92))] p-6 shadow-[0_40px_110px_rgba(120,138,204,0.18)] backdrop-blur-2xl md:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#6e85df]">
            Research Copilot
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-800 md:text-5xl">
            Any ideas brewing today?
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 md:text-base">
            {helperText}
          </p>
        </div>

        <div className="rounded-[28px] border border-white/80 bg-white/70 px-5 py-4 text-sm text-slate-500 shadow-sm">
          <p className="font-semibold text-slate-700">Live Workspace</p>
          <p>Chat, sources, uploads, and research shortcuts in one place.</p>
        </div>
      </div>

      <div className="mb-6 rounded-[34px] border border-white/80 bg-white/90 p-4 shadow-[0_24px_50px_rgba(138,153,202,0.16)]">
        <textarea
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          className="min-h-[120px] w-full resize-none border-none bg-transparent text-base leading-7 text-slate-700 outline-none placeholder:text-slate-300"
          placeholder="Ask any scientific question, summarize papers, compare methods, or plan experiments..."
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            {chatModes.map((mode) => {
              const ModeIcon = mode.icon;
              const isActive = activeMode === mode.key;

              return (
                <button
                key={mode.key}
                type="button"
                title={mode.helper}
                onClick={() => setActiveMode(mode.key)}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "border-[#9aaff8] bg-[#eef2ff] text-[#3455d5] shadow-sm"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:border-[#bbcafc] hover:bg-[#eef2ff] hover:text-[#4763e4]"
                }`}
              >
                <ModeIcon className="text-xs" />
                {mode.label}
              </button>
              );
            })}
          </div>

          <p className="w-full text-xs leading-5 text-slate-400 md:w-auto">
            {activeModeConfig.helper}
          </p>

          <div className="flex items-center gap-2">
            <label className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-[#bbcafc] hover:bg-[#eef2ff] hover:text-[#4763e4]">
              <FaCirclePlus />
              <input
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={(e) => onUpload(e.target.files?.[0])}
              />
            </label>

            <button
              onClick={() => send()}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4968eb] text-white shadow-[0_18px_35px_rgba(73,104,235,0.28)] transition hover:-translate-y-0.5 hover:bg-[#3f5bdd] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              disabled={loading || uploading || !msg.trim()}
            >
              <FaArrowUp />
            </button>
          </div>
        </div>
      </div>

      {historyLoading ? (
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="mx-auto max-w-4xl">
            <LoadingSkeleton lines={5} />
          </div>
        </div>
      ) : isEmpty ? (
        <div className="flex flex-1 flex-col items-center justify-start overflow-y-auto px-2 pb-4 pt-2">
          <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
            {quickActions.map((action) => {
              const ActionIcon = action.icon;

              return (
                <button
                key={action.label}
                onClick={() => setMsg(`Help me with ${action.label.toLowerCase()} for my research project.`)}
                className="flex items-center gap-3 rounded-full border border-white/80 bg-white/85 px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-[#c9d3fb] hover:text-[#4562e1]"
              >
                <ActionIcon className="text-[#4968eb]" />
                {action.label}
              </button>
              );
            })}
          </div>

          <div className="grid w-full max-w-4xl gap-4">
            {suggestions.map((item, index) => (
              <button
                key={item}
                onClick={() => send(item)}
                className={`group flex items-center gap-4 rounded-[24px] border border-white/80 bg-white/82 px-4 py-4 text-left shadow-[0_20px_40px_rgba(137,154,204,0.14)] transition hover:-translate-y-1 hover:border-[#c9d3fb] hover:shadow-[0_24px_52px_rgba(124,143,202,0.2)] ${
                  index % 2 === 1 ? "md:ml-16" : "md:mr-16"
                }`}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#4e6bef,#9fb3ff)] text-lg text-white shadow-md">
                  <FaFileArrowUp />
                </div>
                <div>
                  <p className="text-base leading-7 text-slate-600 transition group-hover:text-slate-800">
                    {item}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Tap to launch this prompt in the assistant
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="mx-auto flex max-w-4xl flex-col gap-5 pb-4">
            {chat.map((entry, index) => (
              <div
                key={`${entry.type}-${index}`}
                className={`flex ${entry.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-[28px] px-5 py-4 text-sm leading-7 shadow-sm md:text-base ${
                    entry.type === "user"
                      ? "bg-[#4968eb] text-white shadow-[0_24px_42px_rgba(73,104,235,0.24)]"
                      : "border border-white/80 bg-white/85 text-slate-700"
                  }`}
                >
                  {entry.mode && (
                    <p className={`mb-2 text-xs font-semibold uppercase tracking-[0.16em] ${
                      entry.type === "user" ? "text-white/70" : "text-[#6e85df]"
                    }`}>
                      {getModeLabel(entry.mode)}
                    </p>
                  )}
                  {entry.text}
                </div>
              </div>
            ))}

            {(loading || uploading) && (
              <div className="flex justify-start">
                <div className="w-full max-w-md">
                  <p className="mb-3 text-sm font-medium text-slate-500">
                    {uploading ? "Indexing your PDF..." : "Searching documents and asking Ollama..."}
                  </p>
                  <LoadingSkeleton lines={uploading ? 4 : 3} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
