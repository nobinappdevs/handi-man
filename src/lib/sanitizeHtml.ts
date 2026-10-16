/**
 * Allowlist sanitiser for rich text that came from an admin or vendor editor
 * and is about to be shown to the public with `dangerouslySetInnerHTML`.
 *
 * It keeps document structure and inline emphasis, and drops everything
 * else: scripts, iframes, forms, event handlers, `style`, classes, and any
 * link or image that is not a plain web URL. Unknown elements are unwrapped -
 * their text survives, the tag does not - so a stray `<font>` or `<div>` from
 * an old editor costs nothing.
 *
 * Browser-only (it parses with `DOMParser`, which does not run scripts or load
 * images while parsing). On the server it returns "", so callers render it
 * after mount.
 */

const ALLOWED = new Set([
  "p", "br", "hr", "strong", "b", "em", "i", "u", "s", "strike", "del", "mark", "sub", "sup", "small",
  "h2", "h3", "h4", "h5", "h6", "blockquote", "code", "pre",
  "ul", "ol", "li",
  "a", "img",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption",
  "span",
]);

/** Elements whose CONTENT is dangerous or meaningless as text - removed whole. */
const DROP = new Set(["script", "style", "iframe", "object", "embed", "form", "input", "button", "textarea", "select", "noscript", "template", "svg", "math", "link", "meta"]);

/** A page's own h1 is the post title, so an h1 in the body steps down. */
const RENAME: Record<string, string> = { h1: "h2" };

const ATTRS: Record<string, string[]> = {
  a: ["href"],
  img: ["src", "alt"],
  th: ["colspan", "rowspan"],
  td: ["colspan", "rowspan"],
  ol: ["start"],
};

const WEB = /^https?:\/\//i;
const LINK = /^(https?:|mailto:|tel:)/i;

function clean(node: Node, doc: Document): Node[] {
  if (node.nodeType === Node.TEXT_NODE) return [doc.createTextNode(node.textContent ?? "")];
  if (node.nodeType !== Node.ELEMENT_NODE) return [];

  const el = node as Element;
  const tag = RENAME[el.tagName.toLowerCase()] ?? el.tagName.toLowerCase();
  if (DROP.has(tag)) return [];

  const children = Array.from(el.childNodes).flatMap((c) => clean(c, doc));
  if (!ALLOWED.has(tag)) return children; // unwrap

  const out = doc.createElement(tag);
  for (const name of ATTRS[tag] ?? []) {
    const value = el.getAttribute(name)?.trim();
    if (!value) continue;
    if (name === "href" && !LINK.test(value)) continue;
    if (name === "src" && !WEB.test(value)) continue;
    out.setAttribute(name, value);
  }
  if (tag === "a") {
    if (!out.hasAttribute("href")) return children; // a link to nowhere is just text
    out.setAttribute("target", "_blank");
    out.setAttribute("rel", "noopener noreferrer nofollow");
  }
  if (tag === "img") {
    if (!out.hasAttribute("src")) return [];
    out.setAttribute("loading", "lazy");
  }
  out.append(...children);
  return [out];
}

export function sanitizeHtml(html: string): string {
  if (!html || typeof window === "undefined" || typeof DOMParser === "undefined") return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  const box = doc.createElement("div");
  box.append(...Array.from(doc.body.childNodes).flatMap((c) => clean(c, doc)));
  return box.innerHTML;
}
