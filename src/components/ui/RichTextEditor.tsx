"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { TextAlign } from "@tiptap/extension-text-align";
import { Color, FontSize, TextStyle } from "@tiptap/extension-text-style";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript as SubscriptExt } from "@tiptap/extension-subscript";
import { Superscript as SuperscriptExt } from "@tiptap/extension-superscript";
import { Image as ImageExt } from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { Placeholder } from "@tiptap/extensions";
import {
  AlignCenter, AlignJustify, AlignLeft, AlignRight, Ban, Baseline, BetweenHorizontalEnd,
  BetweenVerticalEnd, Bold, Code, CodeXml, Columns3, Highlighter, ImagePlus, IndentDecrease,
  IndentIncrease, Italic, Link, List, ListChecks, ListOrdered, Minus, PanelTop, Quote, Redo2,
  RemoveFormatting, Rows3, SquareCode, Strikethrough, Subscript, Superscript, Table, Trash2,
  Underline, Undo2, Unlink,
} from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { Select } from "@/components/ui/Select";
import { cn } from "@/components/ui/cn";

/**
 * A full rich-text editor for long-form copy (a service's description), built
 * on Tiptap - MIT licensed, unlike CKEditor 5 whose free tier is GPL.
 *
 * It covers what the old web form's CKEditor toolbar did: block type, font
 * size, bold / italic / underline / strike / inline code / sub / superscript,
 * clear formatting, text colour and highlight, alignment, bullet / numbered /
 * task lists with indent, links, images by URL, quotes, code blocks, tables
 * (with row / column tools while the cursor is in one), a rule, undo / redo,
 * and an HTML Source view.
 *
 * Controlled through `value` / `onChange` as an HTML string, so it drops into
 * a React Hook Form `Controller`. An empty document reports "" rather than
 * "<p></p>", so a required-field check sees it as empty.
 *
 * Links and images accept http(s) only (links also mailto: / tel:) - the HTML
 * this produces is shown to customers later, and a `javascript:` URL in it
 * would run on their page. Whatever renders this HTML must still sanitise it.
 */

/** Content colours - the writer's data, not themed UI, so plain hex is right. */
const PALETTE = [
  "#12100F", "#5F5856", "#9A9391", "#450C3F", "#7B2C72", "#C0392B",
  "#E67E22", "#F1C40F", "#27AE60", "#16A085", "#2980B9", "#8E44AD",
];
const HIGHLIGHTS = ["#FFF3A3", "#FFD6A5", "#FFADAD", "#CAFFBF", "#A0E7E5", "#BDB2FF", "#F3D1F4", "#E5E5E5"];
const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "30px"];

type BlockType = "p" | "h2" | "h3" | "h4";

/** Adds https:// to a bare domain; refuses anything that is not a web, mail or phone link. */
function cleanLink(raw: string): string | null {
  const v = raw.trim();
  if (!v) return null;
  if (/^(https?:|mailto:|tel:)/i.test(v)) return v;
  if (/^[a-z][a-z0-9+.-]*:/i.test(v)) return null;
  return `https://${v}`;
}
const cleanImage = (raw: string) => (/^https?:\/\//i.test(raw.trim()) ? raw.trim() : null);

/* ─────────────────────────── Toolbar pieces ─────────────────────────── */

function Tool({
  label,
  onClick,
  active = false,
  disabled = false,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      /* Keep the editor's selection: a mousedown on a button would otherwise
         blur the editor and the command would apply to nothing. */
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "flex h-8 w-8 flex-none cursor-pointer items-center justify-center transition-colors disabled:pointer-events-none disabled:opacity-35",
        active ? "bg-primary/12 text-brand" : "text-body hover:bg-sunk hover:text-heading",
      )}
    >
      {children}
    </button>
  );
}

const Divider = () => <i aria-hidden className="mx-1 h-5 w-px flex-none bg-border" />;

/** A toolbar button that opens a small panel under itself. */
function Pop({
  label,
  icon,
  active = false,
  disabled = false,
  children,
}: {
  label: string;
  icon: ReactNode;
  active?: boolean;
  disabled?: boolean;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className="relative flex-none">
      <Tool label={label} active={active || open} disabled={disabled} onClick={() => setOpen((o) => !o)}>
        {icon}
      </Tool>
      {open && (
        <div className="absolute top-full z-30 mt-1.5 min-w-56 border border-border bg-card p-3 shadow-xl shadow-black/10 inset-s-0 dark:shadow-black/40">
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

function Swatches({
  colors,
  onPick,
  onClear,
  clearLabel,
}: {
  colors: string[];
  onPick: (c: string) => void;
  onClear: () => void;
  clearLabel: string;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="grid grid-cols-6 gap-1.5">
        {colors.map((c) => (
          <button
            key={c}
            type="button"
            title={c}
            aria-label={c}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onPick(c)}
            style={{ backgroundColor: c }}
            className="h-6 w-6 cursor-pointer border border-black/10 transition-transform hover:scale-110"
          />
        ))}
      </div>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onClear}
        className="flex cursor-pointer items-center gap-2 text-[12.5px] font-medium text-muted hover:text-heading"
      >
        <Ban size={13} strokeWidth={2} aria-hidden />
        {clearLabel}
      </button>
    </div>
  );
}

/** A one-field form inside a popover (link, image). Not a <form>: the editor
 *  usually sits inside the page's own form, and forms cannot nest. */
function UrlField({
  initial,
  placeholder,
  applyLabel,
  onApply,
  extra,
}: {
  initial: string;
  placeholder: string;
  applyLabel: string;
  onApply: (value: string) => boolean;
  extra?: ReactNode;
}) {
  const [value, setValue] = useState(initial);
  const [bad, setBad] = useState(false);
  const apply = () => setBad(!onApply(value));

  return (
    <div className="flex w-72 max-w-[80vw] flex-col gap-2">
      <input
        autoFocus
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setBad(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            apply();
          }
        }}
        placeholder={placeholder}
        aria-invalid={bad || undefined}
        className={cn(
          "h-9 w-full border bg-surface px-3 text-[13.5px] text-heading outline-none placeholder:text-muted focus:border-primary",
          bad ? "border-danger" : "border-border",
        )}
      />
      <div className="flex items-center justify-between gap-2">
        {extra ?? <i />}
        <button
          type="button"
          onClick={apply}
          className="h-8 cursor-pointer bg-primary px-3.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          {applyLabel}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────── Toolbar ─────────────────────────── */

function Toolbar({ editor, source, onSource }: { editor: Editor; source: boolean; onSource: () => void }) {
  const { t } = useLang();

  /* Tiptap v3 does not re-render on every keystroke; this subscribes the
     toolbar to just the flags it draws. */
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      block: (e.isActive("heading", { level: 2 })
        ? "h2"
        : e.isActive("heading", { level: 3 })
          ? "h3"
          : e.isActive("heading", { level: 4 })
            ? "h4"
            : "p") as BlockType,
      fontSize: (e.getAttributes("textStyle").fontSize as string | undefined) ?? "",
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      strike: e.isActive("strike"),
      code: e.isActive("code"),
      sub: e.isActive("subscript"),
      sup: e.isActive("superscript"),
      color: Boolean(e.getAttributes("textStyle").color),
      highlight: e.isActive("highlight"),
      align: (["left", "center", "right", "justify"] as const).find((a) => e.isActive({ textAlign: a })) ?? "left",
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      task: e.isActive("taskList"),
      link: e.isActive("link"),
      href: (e.getAttributes("link").href as string | undefined) ?? "",
      quote: e.isActive("blockquote"),
      codeBlock: e.isActive("codeBlock"),
      table: e.isActive("table"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
      canSink: e.can().sinkListItem("listItem") || e.can().sinkListItem("taskItem"),
      canLift: e.can().liftListItem("listItem") || e.can().liftListItem("taskItem"),
    }),
  });

  const chain = () => editor.chain().focus();
  const off = source; // every tool but Source is idle while editing HTML

  const setBlock = (b: string) => {
    if (b === "p") chain().setParagraph().run();
    else chain().setHeading({ level: Number(b.slice(1)) as 2 | 3 | 4 }).run();
  };
  const sinkOrLift = (dir: "sink" | "lift") => {
    const item = editor.isActive("taskItem") ? "taskItem" : "listItem";
    if (dir === "sink") chain().sinkListItem(item).run();
    else chain().liftListItem(item).run();
  };

  const SELECT_SKIN =
    "h-8 border border-border bg-card px-2.5 text-[13px] font-medium text-heading hover:border-primary/50 focus-visible:border-primary";

  return (
    <div
      role="toolbar"
      aria-label={t("editor.toolbar")}
      className="sticky top-0 z-20 flex flex-wrap items-center gap-0.5 border-b border-border bg-card px-2 py-1.5"
    >
      <Tool label={t("editor.undo")} disabled={off || !s.canUndo} onClick={() => chain().undo().run()}>
        <Undo2 size={16} strokeWidth={2} aria-hidden />
      </Tool>
      <Tool label={t("editor.redo")} disabled={off || !s.canRedo} onClick={() => chain().redo().run()}>
        <Redo2 size={16} strokeWidth={2} aria-hidden />
      </Tool>
      <Divider />

      <div className="w-34 flex-none">
        <Select
          value={s.block}
          onChange={setBlock}
          disabled={off}
          aria-label={t("editor.blockType")}
          searchable={false}
          options={[
            { value: "p", label: t("editor.paragraph") },
            { value: "h2", label: t("editor.heading2") },
            { value: "h3", label: t("editor.heading3") },
            { value: "h4", label: t("editor.heading4") },
          ]}
          skin={SELECT_SKIN}
        />
      </div>
      <div className="ms-1 w-26 flex-none">
        <Select
          value={s.fontSize || "default"}
          onChange={(v) => (v === "default" ? chain().unsetFontSize().run() : chain().setFontSize(v).run())}
          disabled={off}
          aria-label={t("editor.fontSize")}
          searchable={false}
          options={[
            { value: "default", label: t("editor.fontSizeDefault") },
            ...FONT_SIZES.map((v) => ({ value: v, label: v })),
          ]}
          skin={SELECT_SKIN}
        />
      </div>
      <Divider />

      <Tool label={t("editor.bold")} active={s.bold} disabled={off} onClick={() => chain().toggleBold().run()}>
        <Bold size={16} strokeWidth={2.4} aria-hidden />
      </Tool>
      <Tool label={t("editor.italic")} active={s.italic} disabled={off} onClick={() => chain().toggleItalic().run()}>
        <Italic size={16} strokeWidth={2} aria-hidden />
      </Tool>
      <Tool label={t("editor.underline")} active={s.underline} disabled={off} onClick={() => chain().toggleUnderline().run()}>
        <Underline size={16} strokeWidth={2} aria-hidden />
      </Tool>
      <Tool label={t("editor.strike")} active={s.strike} disabled={off} onClick={() => chain().toggleStrike().run()}>
        <Strikethrough size={16} strokeWidth={2} aria-hidden />
      </Tool>
      <Tool label={t("editor.code")} active={s.code} disabled={off} onClick={() => chain().toggleCode().run()}>
        <Code size={16} strokeWidth={2} aria-hidden />
      </Tool>
      <Tool label={t("editor.subscript")} active={s.sub} disabled={off} onClick={() => chain().toggleSubscript().run()}>
        <Subscript size={16} strokeWidth={2} aria-hidden />
      </Tool>
      <Tool label={t("editor.superscript")} active={s.sup} disabled={off} onClick={() => chain().toggleSuperscript().run()}>
        <Superscript size={16} strokeWidth={2} aria-hidden />
      </Tool>
      <Tool label={t("editor.clearFormatting")} disabled={off} onClick={() => chain().unsetAllMarks().clearNodes().run()}>
        <RemoveFormatting size={16} strokeWidth={2} aria-hidden />
      </Tool>
      <Divider />

      <Pop label={t("editor.textColor")} active={s.color} disabled={off} icon={<Baseline size={16} strokeWidth={2} aria-hidden />}>
        {(close) => (
          <Swatches
            colors={PALETTE}
            clearLabel={t("editor.colorDefault")}
            onPick={(c) => {
              chain().setColor(c).run();
              close();
            }}
            onClear={() => {
              chain().unsetColor().run();
              close();
            }}
          />
        )}
      </Pop>
      <Pop label={t("editor.highlight")} active={s.highlight} disabled={off} icon={<Highlighter size={16} strokeWidth={2} aria-hidden />}>
        {(close) => (
          <Swatches
            colors={HIGHLIGHTS}
            clearLabel={t("editor.highlightNone")}
            onPick={(c) => {
              chain().setHighlight({ color: c }).run();
              close();
            }}
            onClear={() => {
              chain().unsetHighlight().run();
              close();
            }}
          />
        )}
      </Pop>
      <Divider />

      <Tool label={t("editor.alignLeft")} active={s.align === "left"} disabled={off} onClick={() => chain().setTextAlign("left").run()}>
        <AlignLeft size={16} strokeWidth={2} aria-hidden />
      </Tool>
      <Tool label={t("editor.alignCenter")} active={s.align === "center"} disabled={off} onClick={() => chain().setTextAlign("center").run()}>
        <AlignCenter size={16} strokeWidth={2} aria-hidden />
      </Tool>
      <Tool label={t("editor.alignRight")} active={s.align === "right"} disabled={off} onClick={() => chain().setTextAlign("right").run()}>
        <AlignRight size={16} strokeWidth={2} aria-hidden />
      </Tool>
      <Tool label={t("editor.alignJustify")} active={s.align === "justify"} disabled={off} onClick={() => chain().setTextAlign("justify").run()}>
        <AlignJustify size={16} strokeWidth={2} aria-hidden />
      </Tool>
      <Divider />

      <Tool label={t("editor.bulletList")} active={s.bullet} disabled={off} onClick={() => chain().toggleBulletList().run()}>
        <List size={16} strokeWidth={2} aria-hidden />
      </Tool>
      <Tool label={t("editor.orderedList")} active={s.ordered} disabled={off} onClick={() => chain().toggleOrderedList().run()}>
        <ListOrdered size={16} strokeWidth={2} aria-hidden />
      </Tool>
      <Tool label={t("editor.taskList")} active={s.task} disabled={off} onClick={() => chain().toggleTaskList().run()}>
        <ListChecks size={16} strokeWidth={2} aria-hidden />
      </Tool>
      <Tool label={t("editor.outdent")} disabled={off || !s.canLift} onClick={() => sinkOrLift("lift")}>
        <IndentDecrease size={16} strokeWidth={2} aria-hidden />
      </Tool>
      <Tool label={t("editor.indent")} disabled={off || !s.canSink} onClick={() => sinkOrLift("sink")}>
        <IndentIncrease size={16} strokeWidth={2} aria-hidden />
      </Tool>
      <Divider />

      <Pop label={t("editor.link")} active={s.link} disabled={off} icon={<Link size={16} strokeWidth={2} aria-hidden />}>
        {(close) => (
          <UrlField
            initial={s.href}
            placeholder={t("editor.linkPlaceholder")}
            applyLabel={t("editor.apply")}
            onApply={(raw) => {
              if (!raw.trim()) {
                chain().extendMarkRange("link").unsetLink().run();
                close();
                return true;
              }
              const href = cleanLink(raw);
              if (!href) return false;
              chain().extendMarkRange("link").setLink({ href }).run();
              close();
              return true;
            }}
            extra={
              s.link ? (
                <button
                  type="button"
                  onClick={() => {
                    chain().extendMarkRange("link").unsetLink().run();
                    close();
                  }}
                  className="flex cursor-pointer items-center gap-1.5 text-[12.5px] font-medium text-muted hover:text-danger"
                >
                  <Unlink size={13} strokeWidth={2} aria-hidden />
                  {t("editor.removeLink")}
                </button>
              ) : undefined
            }
          />
        )}
      </Pop>
      <Pop label={t("editor.image")} disabled={off} icon={<ImagePlus size={16} strokeWidth={2} aria-hidden />}>
        {(close) => (
          <UrlField
            initial=""
            placeholder={t("editor.imagePlaceholder")}
            applyLabel={t("editor.insert")}
            onApply={(raw) => {
              const src = cleanImage(raw);
              if (!src) return false;
              chain().setImage({ src }).run();
              close();
              return true;
            }}
          />
        )}
      </Pop>
      <Tool label={t("editor.blockquote")} active={s.quote} disabled={off} onClick={() => chain().toggleBlockquote().run()}>
        <Quote size={16} strokeWidth={2} aria-hidden />
      </Tool>
      <Tool label={t("editor.codeBlock")} active={s.codeBlock} disabled={off} onClick={() => chain().toggleCodeBlock().run()}>
        <SquareCode size={16} strokeWidth={2} aria-hidden />
      </Tool>
      <Tool
        label={t("editor.table")}
        active={s.table}
        disabled={off}
        onClick={() => chain().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
      >
        <Table size={16} strokeWidth={2} aria-hidden />
      </Tool>
      <Tool label={t("editor.horizontalRule")} disabled={off} onClick={() => chain().setHorizontalRule().run()}>
        <Minus size={16} strokeWidth={2} aria-hidden />
      </Tool>
      <Divider />

      <button
        type="button"
        aria-pressed={source}
        onClick={onSource}
        className={cn(
          "flex h-8 flex-none cursor-pointer items-center gap-1.5 px-2.5 text-[12.5px] font-semibold transition-colors",
          source ? "bg-primary text-white" : "text-body hover:bg-sunk hover:text-heading",
        )}
      >
        <CodeXml size={15} strokeWidth={2} aria-hidden />
        {t(source ? "editor.visual" : "editor.source")}
      </button>

      {/* Table tools - only while the cursor is inside a table. */}
      {s.table && !off && (
        <div className="flex w-full flex-wrap items-center gap-0.5 border-t border-border pt-1.5 mt-1">
          <Tool label={t("editor.addRow")} onClick={() => chain().addRowAfter().run()}>
            <BetweenHorizontalEnd size={16} strokeWidth={2} aria-hidden />
          </Tool>
          <Tool label={t("editor.addColumn")} onClick={() => chain().addColumnAfter().run()}>
            <BetweenVerticalEnd size={16} strokeWidth={2} aria-hidden />
          </Tool>
          <Tool label={t("editor.deleteRow")} onClick={() => chain().deleteRow().run()}>
            <Rows3 size={16} strokeWidth={2} aria-hidden />
          </Tool>
          <Tool label={t("editor.deleteColumn")} onClick={() => chain().deleteColumn().run()}>
            <Columns3 size={16} strokeWidth={2} aria-hidden />
          </Tool>
          <Tool label={t("editor.toggleHeader")} onClick={() => chain().toggleHeaderRow().run()}>
            <PanelTop size={16} strokeWidth={2} aria-hidden />
          </Tool>
          <Tool label={t("editor.deleteTable")} onClick={() => chain().deleteTable().run()}>
            <Trash2 size={16} strokeWidth={2} aria-hidden />
          </Tool>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── Editor ─────────────────────────── */

export function RichTextEditor({
  value,
  onChange,
  onBlur,
  placeholder,
  label,
  invalid = false,
  footer,
}: {
  /** HTML. "" for empty. */
  value: string;
  onChange: (html: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  /** Accessible name for the writing area. */
  label: string;
  invalid?: boolean;
  /** A slot under the writing area - a character counter, a hint. */
  footer?: ReactNode;
}) {
  const [source, setSource] = useState<string | null>(null);

  const editor = useEditor({
    /* A static export prerenders on the server; rendering the editor there
       and again on the client would mismatch. */
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      TextStyle,
      Color,
      FontSize,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      SubscriptExt,
      SuperscriptExt,
      ImageExt,
      TableKit.configure({ table: { resizable: true } }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder: placeholder ?? "" }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "rte-content min-h-[240px] px-4 py-3.5",
        "aria-label": label,
        "aria-multiline": "true",
        role: "textbox",
      },
    },
    onUpdate: ({ editor: e }) => onChange(e.isEmpty ? "" : e.getHTML()),
    onBlur: () => onBlur?.(),
  });

  /* A value set from outside - the edit form filling in once the listing
     loads - replaces the document. Compared first, so the editor's own
     updates (which come back in as `value`) do not reset the cursor. */
  useEffect(() => {
    if (!editor || source !== null) return;
    const current = editor.isEmpty ? "" : editor.getHTML();
    if (value !== current) editor.commands.setContent(value || "", { emitUpdate: false });
  }, [editor, value, source]);

  const toggleSource = () => {
    if (!editor) return;
    if (source === null) {
      setSource(editor.isEmpty ? "" : editor.getHTML());
    } else {
      editor.commands.setContent(source || "", { emitUpdate: false });
      onChange(editor.isEmpty ? "" : editor.getHTML());
      setSource(null);
    }
  };

  return (
    <div
      className={cn(
        "border bg-card transition-colors focus-within:border-primary",
        invalid ? "border-danger" : "border-border",
      )}
    >
      {editor ? (
        <Toolbar editor={editor} source={source !== null} onSource={toggleSource} />
      ) : (
        <div className="h-[46px] border-b border-border bg-card" aria-hidden />
      )}

      <div className="max-h-[560px] overflow-y-auto">
        {source !== null ? (
          <textarea
            value={source}
            onChange={(e) => {
              setSource(e.target.value);
              onChange(e.target.value.trim());
            }}
            onBlur={onBlur}
            aria-label={label}
            spellCheck={false}
            className="block min-h-[240px] w-full resize-y bg-sunk px-4 py-3.5 font-mono text-[13px] leading-[1.6] text-heading outline-none"
          />
        ) : (
          <EditorContent editor={editor} />
        )}
      </div>

      {footer && <div className="border-t border-border px-4 py-2 text-[12.5px] text-muted">{footer}</div>}
    </div>
  );
}
