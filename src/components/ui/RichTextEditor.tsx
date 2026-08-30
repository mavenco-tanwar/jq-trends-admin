'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Link as LinkIcon,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  FileCode,
  Sparkles,
  Undo,
  Redo,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write detailed luxury descriptions, stories, or policy guides...',
  minHeight = '180px',
}: RichTextEditorProps) {
  const [activeTab, setActiveTab] = useState<'visual' | 'html' | 'preview'>('visual');
  const editorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync value into contentEditable element on mount and external changes
  useEffect(() => {
    if (editorRef.current && activeTab === 'visual') {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value, activeTab]);

  const executeCommand = (command: string, arg: string | undefined = undefined) => {
    if (activeTab !== 'visual') {
      setActiveTab('visual');
      setTimeout(() => {
        document.execCommand(command, false, arg);
        if (editorRef.current) {
          onChange(editorRef.current.innerHTML);
        }
      }, 50);
      return;
    }

    document.execCommand(command, false, arg);
    if (editorRef.current) {
      editorRef.current.focus();
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleVisualInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInsertLink = () => {
    const url = prompt('Enter link URL (e.g. /women or https://...):');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  const handleInsertTag = (startTag: string, endTag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const replacement = `${startTag}${selectedText || 'Text'}${endTag}`;
    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + startTag.length, start + replacement.length - endTag.length);
    }, 10);
  };

  return (
    <div className="border border-slate-700/80 rounded-xl overflow-hidden bg-[#10121A] flex flex-col font-sans transition-all focus-within:border-rose-500/70">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between p-2 bg-[#141620] border-b border-slate-800 text-slate-400 text-xs gap-1.5 select-none">
        {/* Formatting Actions */}
        <div className="flex flex-wrap items-center gap-0.5">
          <button
            type="button"
            onClick={() => executeCommand('bold')}
            className="p-1.5 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('italic')}
            className="p-1.5 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('underline')}
            className="p-1.5 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Underline"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('strikeThrough')}
            className="p-1.5 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Strikethrough"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <button
            type="button"
            onClick={() => executeCommand('formatBlock', '<h2>')}
            className="px-2 py-1 hover:text-white hover:bg-slate-800 rounded font-serif font-bold text-[11px]"
            title="Heading 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => executeCommand('formatBlock', '<h3>')}
            className="px-2 py-1 hover:text-white hover:bg-slate-800 rounded font-serif font-bold text-[11px]"
            title="Heading 3"
          >
            H3
          </button>
          <button
            type="button"
            onClick={() => executeCommand('formatBlock', '<p>')}
            className="px-2 py-1 hover:text-white hover:bg-slate-800 rounded text-[11px]"
            title="Normal Paragraph"
          >
            P
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <button
            type="button"
            onClick={() => executeCommand('insertUnorderedList')}
            className="p-1.5 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Bulleted List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('insertOrderedList')}
            className="p-1.5 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Numbered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('formatBlock', '<blockquote>')}
            className="p-1.5 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Quote Box"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleInsertLink}
            className="p-1.5 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Insert Link"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <button
            type="button"
            onClick={() => executeCommand('justifyLeft')}
            className="p-1.5 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Align Left"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('justifyCenter')}
            className="p-1.5 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Align Center"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('justifyRight')}
            className="p-1.5 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Align Right"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-lg border border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('visual')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
              activeTab === 'visual'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Visual</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('html')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
              activeTab === 'html'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCode className="w-3 h-3" />
            <span>HTML</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
              activeTab === 'preview'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="relative flex-1">
        {/* 1. VISUAL WYSIWYG MODE */}
        {activeTab === 'visual' && (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleVisualInput}
            onBlur={handleVisualInput}
            style={{ minHeight }}
            className="p-4 text-slate-200 text-xs sm:text-sm font-sans leading-relaxed focus:outline-none focus:ring-0 max-h-80 overflow-y-auto prose prose-invert prose-xs"
            data-placeholder={placeholder}
          />
        )}

        {/* 2. RAW HTML MODE */}
        {activeTab === 'html' && (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{ minHeight }}
            placeholder="<p>Write raw HTML markup...</p>"
            className="w-full p-4 bg-transparent text-rose-300 font-mono text-xs leading-relaxed focus:outline-none resize-y max-h-80"
          />
        )}

        {/* 3. LIVE STOREFRONT PREVIEW MODE */}
        {activeTab === 'preview' && (
          <div
            style={{ minHeight }}
            className="p-5 bg-[#FAF6F2] text-[#111111] max-h-80 overflow-y-auto font-sans leading-relaxed text-xs sm:text-sm prose prose-stone max-w-none"
            dangerouslySetInnerHTML={{
              __html:
                value ||
                '<p class="text-slate-400 italic">No content to preview yet. Switch to Visual editor to begin writing.</p>',
            }}
          />
        )}
      </div>

      {/* Footer Info */}
      <div className="px-3 py-1.5 bg-[#141620]/60 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
        <span>
          Mode: <strong className="text-slate-300 capitalize">{activeTab}</strong> • Live Storefront Sync
        </span>
        <span>
          Length: {value ? value.replace(/<[^>]*>?/gm, '').length : 0} chars ({value ? value.split(/\s+/).filter(Boolean).length : 0} words)
        </span>
      </div>
    </div>
  );
}
