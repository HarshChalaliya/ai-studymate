import React from 'react';

/**
 * A clean lightweight Markdown renderer for React
 * Renders bold, italics, inline code, headings, lists, and paragraphs.
 */
export function FormattedText({ text }) {
  if (!text) return null;

  const lines = text.split("\n");
  const elements = [];

  let inList = false;
  let listItems = [];

  const parseInline = (str) => {
    if (!str) return str;
    
    // Split by code blocks, bold, italics
    const parts = [];
    let remaining = str;
    let key = 0;

    // Regex for bold **text** or __text__, code `code`, italic *text*
    const regex = /(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\*[^*]+\*)/g;
    let match;
    let lastIdx = 0;

    while ((match = regex.exec(str)) !== null) {
      if (match.index > lastIdx) {
        parts.push(str.substring(lastIdx, match.index));
      }
      const token = match[0];
      if (token.startsWith("**") || token.startsWith("__")) {
        parts.push(<strong key={key++} className="highlight-bold">{token.slice(2, -2)}</strong>);
      } else if (token.startsWith("`")) {
        parts.push(<code key={key++} className="inline-code">{token.slice(1, -1)}</code>);
      } else if (token.startsWith("*")) {
        parts.push(<em key={key++}>{token.slice(1, -1)}</em>);
      }
      lastIdx = regex.lastIndex;
    }

    if (lastIdx < str.length) {
      parts.push(str.substring(lastIdx));
    }

    return parts.length > 0 ? parts : str;
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    if (!trimmed) {
      if (inList) {
        elements.push(
          <ul key={`ul-${idx}`} className="formatted-list">
            {listItems}
          </ul>
        );
        inList = false;
        listItems = [];
      }
      return;
    }

    // Headings
    if (trimmed.startsWith("### ")) {
      if (inList) {
        elements.push(<ul key={`ul-${idx}`} className="formatted-list">{listItems}</ul>);
        inList = false;
        listItems = [];
      }
      elements.push(<h3 key={idx} className="formatted-h3">{parseInline(trimmed.substring(4))}</h3>);
    } else if (trimmed.startsWith("## ")) {
      if (inList) {
        elements.push(<ul key={`ul-${idx}`} className="formatted-list">{listItems}</ul>);
        inList = false;
        listItems = [];
      }
      elements.push(<h2 key={idx} className="formatted-h2">{parseInline(trimmed.substring(3))}</h2>);
    } else if (trimmed.startsWith("# ")) {
      if (inList) {
        elements.push(<ul key={`ul-${idx}`} className="formatted-list">{listItems}</ul>);
        inList = false;
        listItems = [];
      }
      elements.push(<h1 key={idx} className="formatted-h1">{parseInline(trimmed.substring(2))}</h1>);
    } 
    // List items
    else if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
      inList = true;
      listItems.push(<li key={`li-${idx}`}>{parseInline(trimmed.replace(/^[-*•]\s*/, ""))}</li>);
    } 
    // Numbered list items
    else if (/^\d+\.\s/.test(trimmed)) {
      if (inList) {
        elements.push(<ul key={`ul-${idx}`} className="formatted-list">{listItems}</ul>);
        inList = false;
        listItems = [];
      }
      elements.push(
        <div key={idx} className="formatted-num-item">
          {parseInline(trimmed)}
        </div>
      );
    } 
    // Regular paragraph
    else {
      if (inList) {
        elements.push(<ul key={`ul-${idx}`} className="formatted-list">{listItems}</ul>);
        inList = false;
        listItems = [];
      }
      elements.push(<p key={idx} className="formatted-p">{parseInline(trimmed)}</p>);
    }
  });

  if (inList) {
    elements.push(<ul key={`ul-last`} className="formatted-list">{listItems}</ul>);
  }

  return <div className="formatted-markdown">{elements}</div>;
}
