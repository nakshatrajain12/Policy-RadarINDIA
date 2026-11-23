"use client";

import React from "react";

interface Props {
  content: string;
  className?: string;
  onSchemeClick?: (schemeName: string) => void;
}

/**
 * Parses inline markdown:
 * - **bold**
 * - *italic*
 * - `code`
 * - [text](url)
 * Ensures NO literal "**" or "`" is ever displayed.
 */
function parseInline(text: string): React.ReactNode[] {
  // Regex pattern matching: **bold**, `code`, [link](url), *italic*
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|\*[^*]+\*)/g;
  const parts = text.split(pattern);

  return parts.map((part, idx) => {
    if (!part) return null;

    // Bold: **text**
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      const inner = part.slice(2, -2);
      return (
        <strong key={idx} className="font-semibold text-text">
          {inner}
        </strong>
      );
    }

    // Inline Code: `code`
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      const inner = part.slice(1, -1);
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded bg-surface border border-border text-accent font-mono text-[11px]"
        >
          {inner}
        </code>
      );
    }

    // Link: [title](url)
    if (part.startsWith("[") && part.includes("](") && part.endsWith(")")) {
      const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (match) {
        return (
          <a
            key={idx}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline underline-offset-2 hover:opacity-80 transition-opacity"
          >
            {match[1]}
          </a>
        );
      }
    }

    // Italic: *text*
    if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
      const inner = part.slice(1, -1);
      return (
        <em key={idx} className="italic text-muted">
          {inner}
        </em>
      );
    }

    // Clean any stray formatting characters just in case
    const cleanText = part.replace(/\*\*/g, "");
    return <span key={idx}>{cleanText}</span>;
  });
}

export function MarkdownMessage({ content, className = "", onSchemeClick }: Props) {
  if (!content) return null;

  // Split content into lines
  const lines = content.split("\n");
  const nodes: React.ReactNode[] = [];
  let currentList: { key: number; items: string[] } | null = null;

  const flushList = () => {
    if (currentList && currentList.items.length > 0) {
      const listKey = currentList.key;
      nodes.push(
        <ul key={`ul-${listKey}`} className="my-2 space-y-1.5 text-xs text-text pl-1">
          {currentList.items.map((item, itemIdx) => (
            <li key={itemIdx} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
              <div className="flex-1 leading-relaxed">
                {parseInline(item)}
              </div>
            </li>
          ))}
        </ul>
      );
      currentList = null;
    }
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();

    // Empty line -> paragraph separator
    if (!line) {
      flushList();
      return;
    }

    // Headings
    if (line.startsWith("### ")) {
      flushList();
      nodes.push(
        <h4 key={idx} className="text-sm font-bold text-text mt-3 mb-1 tracking-tight">
          {parseInline(line.slice(4))}
        </h4>
      );
      return;
    }
    if (line.startsWith("## ")) {
      flushList();
      nodes.push(
        <h3 key={idx} className="text-base font-bold text-text mt-3 mb-1.5 tracking-tight">
          {parseInline(line.slice(3))}
        </h3>
      );
      return;
    }
    if (line.startsWith("# ")) {
      flushList();
      nodes.push(
        <h2 key={idx} className="text-lg font-bold text-text mt-4 mb-2 tracking-tight">
          {parseInline(line.slice(2))}
        </h2>
      );
      return;
    }

    // Bullet items: starts with • or - or *
    if (line.startsWith("• ") || line.startsWith("- ") || line.startsWith("* ")) {
      const itemText = line.slice(2).trim();
      if (!currentList) {
        currentList = { key: idx, items: [itemText] };
      } else {
        currentList.items.push(itemText);
      }
      return;
    }

    // Numbered lists: e.g. "1. ", "2. "
    const numMatch = line.match(/^\d+\.\s+(.*)$/);
    if (numMatch) {
      flushList();
      nodes.push(
        <div key={idx} className="flex items-start gap-2 my-1 text-xs text-text">
          <span className="font-semibold text-accent shrink-0">{line.slice(0, line.indexOf(" ") + 1)}</span>
          <div className="flex-1 leading-relaxed">{parseInline(numMatch[1])}</div>
        </div>
      );
      return;
    }

    // Callout / Tip box (starts with 💡 or >)
    if (line.startsWith("💡") || line.startsWith("> ")) {
      flushList();
      const calloutText = line.startsWith("> ") ? line.slice(2) : line;
      nodes.push(
        <div
          key={idx}
          className="my-2.5 p-2.5 rounded-lg bg-surface border border-accent/25 text-xs text-muted leading-relaxed"
        >
          {parseInline(calloutText)}
        </div>
      );
      return;
    }

    // Regular line
    flushList();
    nodes.push(
      <p key={idx} className="my-1.5 leading-relaxed text-xs text-text">
        {parseInline(line)}
      </p>
    );
  });

  flushList();

  return <div className={`space-y-1 ${className}`}>{nodes}</div>;
}
