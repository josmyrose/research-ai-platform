from dataclasses import dataclass


DEFAULT_CHAT_MODE = "lite"


@dataclass(frozen=True)
class ChatModeConfig:
    key: str
    label: str
    retrieval_chunks: int
    max_context_chars: int
    temperature: float
    instruction: str


CHAT_MODES = {
    "lite": ChatModeConfig(
        key="lite",
        label="Lite Mode",
        retrieval_chunks=4,
        max_context_chars=4500,
        temperature=0.15,
        instruction=(
            "Give a concise answer in 1-3 short paragraphs. Focus only on the most direct answer "
            "supported by the document context."
        ),
    ),
    "deep_review": ChatModeConfig(
        key="deep_review",
        label="Deep Review",
        retrieval_chunks=10,
        max_context_chars=14000,
        temperature=0.2,
        instruction=(
            "Produce a structured research review. Include: short answer, key findings, evidence from "
            "the document context, limitations or uncertainty, and practical next steps. Use source "
            "numbers wherever the evidence supports a point."
        ),
    ),
    "source_mode": ChatModeConfig(
        key="source_mode",
        label="Source Mode",
        retrieval_chunks=8,
        max_context_chars=10000,
        temperature=0.05,
        instruction=(
            "Answer with strict source grounding. Use bullets grouped by source number. Do not add "
            "claims that are not present in the document context. If evidence is weak, say so."
        ),
    ),
}


def normalize_chat_mode(mode):
    normalized_mode = (mode or DEFAULT_CHAT_MODE).strip().lower().replace("-", "_")
    if normalized_mode not in CHAT_MODES:
        return DEFAULT_CHAT_MODE
    return normalized_mode


def get_chat_mode_config(mode):
    return CHAT_MODES[normalize_chat_mode(mode)]
