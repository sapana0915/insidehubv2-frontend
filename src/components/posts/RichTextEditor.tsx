import { useEffect, useState, type ReactNode } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Undo2,
  Redo2,
} from "lucide-react";
import { FontSize } from "./fontSize";

interface RichTextEditorProps {
  label?: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  hint?: string;
}

const HEADING_LEVELS = [1, 2, 3, 4, 5, 6] as const;

const FONT_SIZES = [
  { label: "Default", value: "" },
  { label: "12", value: "12px" },
  { label: "14", value: "14px" },
  { label: "16", value: "16px" },
  { label: "18", value: "18px" },
  { label: "20", value: "20px" },
  { label: "24", value: "24px" },
  { label: "28", value: "28px" },
  { label: "32", value: "32px" },
  { label: "36", value: "36px" },
] as const;

const toolbarSelectClass =
  "h-8 max-w-[7.5rem] rounded-sm border-0 bg-transparent px-1.5 font-mono text-[0.65rem] uppercase tracking-[0.08em] text-ink-soft hover:bg-ink/8 hover:text-ink focus:outline-none focus-visible:bg-ink/8";

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-sm transition ${
        active ? "bg-ink text-paper" : "text-ink-soft hover:bg-ink/8 hover:text-ink"
      } disabled:opacity-35`}
    >
      {children}
    </button>
  );
}

function currentHeadingValue(editor: NonNullable<ReturnType<typeof useEditor>>): string {
  for (const level of HEADING_LEVELS) {
    if (editor.isActive("heading", { level })) return String(level);
  }
  return "p";
}

export function RichTextEditor({ label, value, onChange, placeholder, hint }: RichTextEditorProps) {
  const [, setToolbarTick] = useState(0);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [...HEADING_LEVELS] },
        code: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      TextStyle,
      FontSize,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "Start writing…",
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "rich-text-editor lined-paper min-h-[22rem] w-full px-5 py-3 font-display text-lg text-ink focus:outline-none",
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  useEffect(() => {
    if (!editor) return;
    const refresh = () => setToolbarTick((n) => n + 1);
    editor.on("selectionUpdate", refresh);
    editor.on("transaction", refresh);
    return () => {
      editor.off("selectionUpdate", refresh);
      editor.off("transaction", refresh);
    };
  }, [editor]);

  function setLink() {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");
    if (url === null) return;
    const trimmed = url.trim();
    if (!trimmed) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: trimmed }).run();
  }

  function onHeadingChange(next: string) {
    if (!editor) return;
    if (next === "p") {
      editor.chain().focus().setParagraph().run();
      return;
    }
    const level = Number(next) as (typeof HEADING_LEVELS)[number];
    editor.chain().focus().setHeading({ level }).run();
  }

  function onFontSizeChange(next: string) {
    if (!editor) return;
    if (!next) {
      editor.chain().focus().unsetFontSize().run();
      return;
    }
    editor.chain().focus().setFontSize(next).run();
  }

  const headingValue = editor ? currentHeadingValue(editor) : "p";
  const fontSizeValue = (editor?.getAttributes("textStyle").fontSize as string | undefined) ?? "";

  return (
    <div className="block">
      {label ? <span className="eyebrow">{label}</span> : null}
      <div className="mt-2 overflow-hidden border border-ink/15">
        <div
          className="flex flex-wrap items-center gap-0.5 border-b border-ink/10 bg-card px-2 py-1.5"
          role="toolbar"
          aria-label="Text formatting"
        >
          <label className="sr-only" htmlFor="rte-heading">
            Heading
          </label>
          <select
            id="rte-heading"
            className={toolbarSelectClass}
            value={headingValue}
            disabled={!editor}
            onChange={(e) => onHeadingChange(e.target.value)}
            title="Paragraph style"
          >
            <option value="p">Paragraph</option>
            {HEADING_LEVELS.map((level) => (
              <option key={level} value={level}>
                Heading {level}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="rte-font-size">
            Font size
          </label>
          <select
            id="rte-font-size"
            className={toolbarSelectClass}
            value={FONT_SIZES.some((s) => s.value === fontSizeValue) ? fontSizeValue : ""}
            disabled={!editor}
            onChange={(e) => onFontSizeChange(e.target.value)}
            title="Font size"
          >
            {FONT_SIZES.map((size) => (
              <option key={size.label} value={size.value}>
                {size.value ? `${size.label}px` : size.label}
              </option>
            ))}
          </select>

          <span className="mx-1 h-5 w-px bg-ink/15" aria-hidden />
          <ToolbarButton
            label="Bold"
            active={editor?.isActive("bold")}
            disabled={!editor?.can().chain().focus().toggleBold().run()}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          >
            <Bold className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            label="Italic"
            active={editor?.isActive("italic")}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            label="Underline"
            active={editor?.isActive("underline")}
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            label="Strikethrough"
            active={editor?.isActive("strike")}
            onClick={() => editor?.chain().focus().toggleStrike().run()}
          >
            <Strikethrough className="h-3.5 w-3.5" />
          </ToolbarButton>
          <span className="mx-1 h-5 w-px bg-ink/15" aria-hidden />
          <ToolbarButton
            label="Bullet list"
            active={editor?.isActive("bulletList")}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          >
            <List className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            label="Numbered list"
            active={editor?.isActive("orderedList")}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            label="Quote"
            active={editor?.isActive("blockquote")}
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton label="Link" active={editor?.isActive("link")} onClick={setLink}>
            <LinkIcon className="h-3.5 w-3.5" />
          </ToolbarButton>
          <span className="mx-1 h-5 w-px bg-ink/15" aria-hidden />
          <ToolbarButton label="Undo" onClick={() => editor?.chain().focus().undo().run()}>
            <Undo2 className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton label="Redo" onClick={() => editor?.chain().focus().redo().run()}>
            <Redo2 className="h-3.5 w-3.5" />
          </ToolbarButton>
        </div>
        <EditorContent editor={editor} />
      </div>
      {hint ? <span className="mt-1 block text-xs text-ink-faint">{hint}</span> : null}
    </div>
  );
}
