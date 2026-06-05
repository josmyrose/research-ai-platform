import { useEffect, useMemo, useRef, useState } from "react";
import {
  FaArrowRotateRight,
  FaArrowUp,
  FaBookOpen,
  FaBoxArchive,
  FaCircleCheck,
  FaCirclePlus,
  FaCopy,
  FaDatabase,
  FaDownload,
  FaFileArrowUp,
  FaFileLines,
  FaFlask,
  FaGlobe,
  FaLayerGroup,
  FaPenNib,
  FaQuoteLeft,
  FaRegThumbsDown,
  FaRegThumbsUp,
  FaRocket,
  FaWandMagicSparkles,
  FaXmark,
} from "react-icons/fa6";

import {
  sendChatMessage,
  uploadResearchFile,
} from "../../../services/researchService";
import { LoadingSkeleton } from "../../../ui";

const CHARACTER_LIMIT = 6000;
const CHAT_CACHE_PREFIX = "research-chat-cache:";
const CHAT_CACHE_TTL_MS = 30 * 60 * 1000;

const chatModes = [
  {
    key: "lite",
    icon: FaRocket,
    label: "Lite",
    helper: "Fast answer with key references.",
  },
  {
    key: "deep_review",
    icon: FaFlask,
    label: "Deep Review",
    helper: "Structured synthesis with methods, findings, limits, and conclusion.",
  },
  {
    key: "source_mode",
    icon: FaBookOpen,
    label: "Source Mode",
    helper: "Citation-first answer with passages, pages, and traceability.",
  },
];

const retrievalScopes = [
  { key: "document", icon: FaFileLines, label: "Document", helper: "Uploaded files only" },
  { key: "web", icon: FaGlobe, label: "Web", helper: "External academic search when connectors are configured" },
  { key: "hybrid", icon: FaLayerGroup, label: "Hybrid", helper: "Uploaded documents first, then academic web when configured" },
];

const citationStyles = [
  { key: "numbered", label: "[1]" },
  { key: "inline", label: "Inline" },
  { key: "apa", label: "APA" },
  { key: "ieee", label: "IEEE" },
];

const cacheOptions = [
  { key: "off", label: "Live", helper: "Always generate a fresh answer." },
  { key: "multi_level", icon: FaDatabase, label: "Cache", helper: "Use browser, Redis, vector, and database cache layers." },
];

const assistantTools = [
  {
    icon: FaPenNib,
    label: "Rewrite",
    prompt: "Rewrite the following text in a clear academic tone:\n\n",
  },
  {
    icon: FaBoxArchive,
    label: "Summarize",
    prompt: "Summarize the following research material into concise bullet points:\n\n",
  },
  {
    icon: FaFlask,
    label: "Literature Review",
    prompt:
      "Generate a structured literature review with themes, methodologies, gaps, and future work for:\n\n",
  },
  {
    icon: FaWandMagicSparkles,
    label: "Diagram",
    prompt:
      "Generate a Mermaid architecture or flowchart diagram for this research workflow:\n\n",
  },
];

const suggestions = [
  "Explain data security using my uploaded sources.",
  "Compare the methodology and limitations across these papers.",
  "Extract quoted evidence with page numbers about the main findings.",
  "Generate a literature review outline with gaps and future work.",
];

const scopeNotices = {
  document: "Document scope searches only your uploaded and indexed files.",
  web: "Web scope is reserved for academic providers such as CrossRef, Semantic Scholar, PubMed, and arXiv. In this build, those connectors are not configured yet, so answers still fall back to indexed documents.",
  hybrid: "Hybrid scope means documents first, then academic web sources when connectors are configured. In this build, external web retrieval is not active yet.",
};

const getModeLabel = (modeKey) =>
  chatModes.find((mode) => mode.key === modeKey)?.label ?? "Lite";

const buildMarkdownExport = (chat) =>
  chat
    .map((entry) => {
      const speaker = entry.type === "user" ? "User" : "Assistant";
      const sources =
        entry.sources?.length > 0
          ? `\n\nSources:\n${entry.sources.map((source) => `- ${source.citation}`).join("\n")}`
          : "";
      return `## ${speaker}\n\n${entry.text}${sources}`;
    })
    .join("\n\n");

const buildBrowserCacheKey = (message, options) =>
  `${CHAT_CACHE_PREFIX}${JSON.stringify({
    message,
    mode: options.mode,
    scope: options.scope,
    citation_style: options.citation_style,
    top_k: options.top_k,
  })}`;

const getBrowserCache = (key) => {
  try {
    const cached = JSON.parse(localStorage.getItem(key) ?? "null");
    if (!cached || Date.now() - cached.createdAt > CHAT_CACHE_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return cached.payload;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
};

const setBrowserCache = (key, payload) => {
  try {
    localStorage.setItem(key, JSON.stringify({ createdAt: Date.now(), payload }));
  } catch {
    // Browser storage can be unavailable or full; the backend cache still applies.
  }
};

const clearBrowserChatCache = () => {
  Object.keys(localStorage)
    .filter((key) => key.startsWith(CHAT_CACHE_PREFIX))
    .forEach((key) => localStorage.removeItem(key));
};

function SegmentedControl({ items, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const Icon = item.icon;
        const active = value === item.key;

        return (
          <button
            key={item.key}
            type="button"
            title={item.helper || item.label}
            onClick={() => onChange(item.key)}
            className={`flex min-h-10 items-center gap-2 rounded-2xl border px-3 text-sm font-semibold transition ${
              active
                ? "border-[#9aaff8] bg-[#eef2ff] text-[#3455d5] shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-[#bbcafc] hover:bg-[#eef2ff]"
            }`}
          >
            {Icon && <Icon className="text-xs" />}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function ReferencePanel({ sources, citationStyle }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <aside className="min-h-0 rounded-[28px] border border-white/80 bg-white/86 p-4 shadow-[0_20px_44px_rgba(137,154,204,0.14)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">References</p>
          <p className="text-xs text-slate-400">{sources.length} sources - {citationStyle.toUpperCase()}</p>
        </div>
        <FaQuoteLeft className="text-[#4968eb]" />
      </div>

      {sources.length === 0 ? (
        <p className="text-sm leading-6 text-slate-500">
          Sources appear here after a grounded answer is generated.
        </p>
      ) : (
        <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
          {sources.map((source) => (
            <button
              key={`${source.id}-${source.title}`}
              type="button"
              onClick={() => setExpanded(expanded === source.id ? null : source.id)}
              className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-3 text-left transition hover:border-[#c7d2fe] hover:bg-white"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">{source.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {source.page ? `Page ${source.page}` : "Indexed text"}
                    {source.confidence !== null && source.confidence !== undefined
                      ? ` - ${source.confidence}% confidence`
                      : ""}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-[#eef2ff] px-2 py-1 text-xs font-semibold text-[#4562e1]">
                  {source.id}
                </span>
              </div>
              <p className="mt-2 text-xs font-semibold text-slate-500">{source.citation}</p>
              {expanded === source.id && (
                <p className="mt-3 text-xs leading-5 text-slate-600">{source.quote}</p>
              )}
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}

export default function ChatBox({ resetSignal = 0 }) {
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeMode, setActiveMode] = useState("lite");
  const [scope, setScope] = useState("hybrid");
  const [citationStyle, setCitationStyle] = useState("numbered");
  const [cacheMode, setCacheMode] = useState("multi_level");
  const [topK, setTopK] = useState(6);
  const [feedback, setFeedback] = useState({});
  const textareaRef = useRef(null);

  const latestSources = useMemo(
    () => [...chat].reverse().find((entry) => entry.type === "ai" && entry.sources?.length)?.sources ?? [],
    [chat],
  );
  const activeModeConfig = chatModes.find((mode) => mode.key === activeMode) ?? chatModes[0];
  const scopeConfig = retrievalScopes.find((item) => item.key === scope) ?? retrievalScopes[2];
  const remainingChars = CHARACTER_LIMIT - msg.length;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 240)}px`;
    }
  }, [msg]);

  useEffect(() => {
    if (resetSignal > 0) {
      setChat([]);
      setMsg("");
      setFeedback({});
    }
  }, [resetSignal]);

  const send = async (preset, overrideOptions = {}) => {
    const nextMessage = (preset ?? msg).trim();
    if (!nextMessage || nextMessage.length > CHARACTER_LIMIT) {
      return;
    }

    const requestOptions = {
      mode: overrideOptions.mode ?? activeMode,
      scope,
      citation_style: citationStyle,
      top_k: topK,
      cache: cacheMode,
    };

    const userEntry = {
      id: `user-${Date.now()}`,
      type: "user",
      text: nextMessage,
      mode: requestOptions.mode,
    };

    setChat((prev) => [...prev, userEntry]);
    setMsg("");

    const browserCacheKey = buildBrowserCacheKey(nextMessage, requestOptions);
    if (cacheMode === "multi_level") {
      const browserCached = getBrowserCache(browserCacheKey);
      if (browserCached) {
        setChat((prev) => [
          ...prev,
          {
            id: `ai-browser-cache-${Date.now()}`,
            type: "ai",
            text: browserCached.response,
            mode: requestOptions.mode,
            scope: browserCached.scope ?? scope,
            citationStyle: browserCached.citation_style ?? citationStyle,
            sources: browserCached.sources ?? [],
            cacheLayer: "browser",
          },
        ]);
        return;
      }
    }

    setLoading(true);

    try {
      const res = await sendChatMessage(nextMessage, requestOptions);
      const aiPayload = {
        response: res.data.response,
        scope: res.data.scope ?? scope,
        citation_style: res.data.citation_style ?? citationStyle,
        sources: res.data.sources ?? [],
      };
      if (cacheMode === "multi_level") {
        setBrowserCache(browserCacheKey, aiPayload);
      }
      setChat((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          type: "ai",
          text: aiPayload.response,
          mode: requestOptions.mode,
          scope: aiPayload.scope,
          citationStyle: aiPayload.citation_style,
          sources: aiPayload.sources,
          cacheLayer: res.data.cache_layer,
        },
      ]);
    } catch (error) {
      const errorMessage =
        error.code === "ECONNABORTED"
          ? "The answer is taking too long. Check that Ollama is running and the selected model is installed, then try again."
          : error.response?.data?.detail ||
            "I couldn't reach the research assistant service. Please try again in a moment.";

      setChat((prev) => [
        ...prev,
        { id: `ai-error-${Date.now()}`, type: "ai", text: errorMessage, mode: requestOptions.mode, sources: [] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const uploadFiles = async (files) => {
    const selectedFiles = Array.from(files ?? []);
    if (selectedFiles.length === 0) {
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    clearBrowserChatCache();

    for (let index = 0; index < selectedFiles.length; index += 1) {
      const file = selectedFiles[index];
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await uploadResearchFile(formData);
        const result = response.data;
        setChat((prev) => [
          ...prev,
          {
            id: `upload-${file.name}-${Date.now()}`,
            type: "ai",
            text: `Uploaded ${result.filename} (${result.file_type}, ${result.page_count} pages/sections, ${result.chunk_count} indexed chunks).\n\nSummary: ${result.summary}`,
            mode: activeMode,
            sources: [],
          },
        ]);
      } catch (error) {
        setChat((prev) => [
          ...prev,
          {
            id: `upload-error-${file.name}-${Date.now()}`,
            type: "ai",
            text: error.response?.data?.detail || `Upload failed for ${file.name}.`,
            mode: activeMode,
            sources: [],
          },
        ]);
      } finally {
        setUploadProgress(Math.round(((index + 1) / selectedFiles.length) * 100));
      }
    }

    setUploading(false);
  };

  const exportMarkdown = () => {
    const blob = new Blob([buildMarkdownExport(chat)], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "research-chat-export.md";
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyText = async (text) => {
    await navigator.clipboard?.writeText(text);
  };

  const applyTool = (tool) => {
    setMsg(`${tool.prompt}${msg}`);
    textareaRef.current?.focus();
  };

  return (
    <section className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[32px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(242,246,255,0.94))] p-4 shadow-[0_40px_110px_rgba(120,138,204,0.18)] backdrop-blur-2xl md:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#6e85df]">
            Research Chat Workspace
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-800 md:text-4xl">
            Ask, retrieve, cite, and refine
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            {activeModeConfig.helper} Scope: {scopeConfig.helper}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            title="Export Markdown"
            onClick={exportMarkdown}
            disabled={chat.length === 0}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-[#bbcafc] hover:bg-[#eef2ff] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaDownload />
          </button>
          <label
            title="Upload files"
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-[#bbcafc] hover:bg-[#eef2ff]"
          >
            <FaCirclePlus />
            <input
              type="file"
              multiple
              className="hidden"
              accept=".pdf,.docx,.txt,.pptx,.csv"
              onChange={(event) => uploadFiles(event.target.files)}
            />
          </label>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 overflow-hidden xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-h-0 flex-col overflow-hidden">
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragActive(false);
              uploadFiles(event.dataTransfer.files);
            }}
            className={`mb-4 rounded-[28px] border p-4 shadow-[0_24px_50px_rgba(138,153,202,0.14)] transition ${
              dragActive ? "border-[#7f98f5] bg-[#eef2ff]" : "border-white/80 bg-white/92"
            }`}
          >
            <textarea
              ref={textareaRef}
              value={msg}
              maxLength={CHARACTER_LIMIT}
              onChange={(event) => setMsg(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  send();
                }
              }}
              className="max-h-[240px] min-h-[104px] w-full resize-none border-none bg-transparent text-base leading-7 text-slate-700 outline-none placeholder:text-slate-300"
              placeholder="Ask a research question, paste text, request a literature review, or drop files here..."
            />

            <div className="mt-3 grid gap-3 border-t border-slate-100 pt-4">
              <SegmentedControl items={chatModes} value={activeMode} onChange={setActiveMode} />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <SegmentedControl items={retrievalScopes} value={scope} onChange={setScope} />
                <div className="flex flex-wrap items-center gap-2">
                  <SegmentedControl items={cacheOptions} value={cacheMode} onChange={setCacheMode} />
                  <select
                    value={citationStyle}
                    onChange={(event) => setCitationStyle(event.target.value)}
                    className="min-h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 outline-none"
                  >
                    {citationStyles.map((style) => (
                      <option key={style.key} value={style.key}>{style.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="rounded-2xl border border-[#c7d2fe] bg-[#eef2ff] px-4 py-3 text-sm leading-6 text-[#3f5bdd]">
                {scopeNotices[scope]}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <span>Top-K</span>
                  <input
                    type="range"
                    min="3"
                    max="12"
                    value={topK}
                    onChange={(event) => setTopK(Number(event.target.value))}
                    className="w-28"
                  />
                  <span className="font-semibold text-slate-700">{topK}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs ${remainingChars < 300 ? "text-rose-500" : "text-slate-400"}`}>
                    {remainingChars} left
                  </span>
                  <button
                    type="button"
                    onClick={() => send()}
                    disabled={loading || uploading || !msg.trim()}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4968eb] text-white shadow-[0_18px_35px_rgba(73,104,235,0.28)] transition hover:-translate-y-0.5 hover:bg-[#3f5bdd] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                  >
                    <FaArrowUp />
                  </button>
                </div>
              </div>
              {uploading && (
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full bg-[#4968eb] transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
              )}
            </div>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {assistantTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.label}
                  type="button"
                  onClick={() => applyTool(tool)}
                  className="flex min-h-10 items-center gap-2 rounded-2xl border border-white/80 bg-white/84 px-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-[#c9d3fb] hover:text-[#4562e1]"
                >
                  <Icon className="text-[#4968eb]" />
                  {tool.label}
                </button>
              );
            })}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            {chat.length === 0 ? (
              <div className="grid gap-3">
                {suggestions.map((item) => (
                  <button
                    key={item}
                    onClick={() => send(item)}
                    className="group flex items-center gap-4 rounded-[24px] border border-white/80 bg-white/82 px-4 py-4 text-left shadow-[0_18px_36px_rgba(137,154,204,0.12)] transition hover:-translate-y-0.5 hover:border-[#c9d3fb]"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#4968eb]">
                      <FaFileArrowUp />
                    </span>
                    <span className="text-sm leading-6 text-slate-600 group-hover:text-slate-800">{item}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4 pb-4">
                {chat.map((entry, index) => (
                  <div key={entry.id ?? `${entry.type}-${index}`} className={`flex ${entry.type === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[88%] rounded-[24px] px-5 py-4 text-sm leading-7 shadow-sm md:text-base ${
                        entry.type === "user"
                          ? "bg-[#4968eb] text-white shadow-[0_24px_42px_rgba(73,104,235,0.22)]"
                          : "border border-white/80 bg-white/88 text-slate-700"
                      }`}
                    >
                      {entry.mode && (
                        <div className={`mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] ${
                          entry.type === "user" ? "text-white/70" : "text-[#6e85df]"
                        }`}>
                          <span>{getModeLabel(entry.mode)}</span>
                          {entry.cacheLayer && (
                            <span className="rounded-full bg-[#eef2ff] px-2 py-1 text-[10px] tracking-normal text-[#4562e1]">
                              {entry.cacheLayer}
                            </span>
                          )}
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{entry.text}</p>
                      {entry.sources?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {entry.sources.slice(0, 4).map((source) => (
                            <span key={`${entry.id}-${source.id}`} className="rounded-full bg-[#eef2ff] px-3 py-1 text-xs font-semibold text-[#4562e1]">
                              {source.citation}
                            </span>
                          ))}
                        </div>
                      )}
                      {entry.type === "ai" && (
                        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                          <button title="Copy" onClick={() => copyText(entry.text)} className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-50 hover:text-[#4968eb]">
                            <FaCopy />
                          </button>
                          <button title="Regenerate" onClick={() => send(chat[index - 1]?.text ?? "")} className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-50 hover:text-[#4968eb]">
                            <FaArrowRotateRight />
                          </button>
                          <button title="Helpful" onClick={() => setFeedback((prev) => ({ ...prev, [entry.id]: "up" }))} className={`flex h-9 w-9 items-center justify-center rounded-xl transition hover:bg-slate-50 ${feedback[entry.id] === "up" ? "text-emerald-500" : "text-slate-400"}`}>
                            <FaRegThumbsUp />
                          </button>
                          <button title="Not helpful" onClick={() => setFeedback((prev) => ({ ...prev, [entry.id]: "down" }))} className={`flex h-9 w-9 items-center justify-center rounded-xl transition hover:bg-slate-50 ${feedback[entry.id] === "down" ? "text-rose-500" : "text-slate-400"}`}>
                            <FaRegThumbsDown />
                          </button>
                          {feedback[entry.id] && (
                            <span className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                              <FaCircleCheck /> Feedback saved
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {(loading || uploading) && (
                  <div className="w-full max-w-md">
                    <p className="mb-3 text-sm font-medium text-slate-500">
                      {uploading ? "Indexing your documents..." : "Retrieving sources and generating an answer..."}
                    </p>
                    <LoadingSkeleton lines={uploading ? 4 : 3} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="hidden min-h-0 xl:block">
          <ReferencePanel sources={latestSources} citationStyle={citationStyle} />
        </div>
      </div>

      {dragActive && (
        <div className="pointer-events-none absolute inset-8 flex items-center justify-center rounded-[32px] border-2 border-dashed border-[#7f98f5] bg-white/70 text-[#3455d5] backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 text-sm font-semibold shadow-lg">
            <FaFileArrowUp />
            Drop files to upload
            <FaXmark className="opacity-0" />
          </div>
        </div>
      )}
    </section>
  );
}
