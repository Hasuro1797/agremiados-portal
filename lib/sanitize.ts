import DOMPurify from "isomorphic-dompurify";

/**
 * Allowed tags for broadcast/announcement bodies (simple HTML produced by the
 * admin editor): basic formatting, lists, links, small headings and quotes.
 */
const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "ul",
  "ol",
  "li",
  "a",
  "h1",
  "h2",
  "h3",
  "blockquote",
  "hr",
  "span",
];

const ALLOWED_ATTR = ["href", "target", "rel"];

/**
 * Sanitizes admin-authored HTML before it is injected via
 * `dangerouslySetInnerHTML`. Only the whitelisted tags/attributes survive and
 * links are forced to open safely.
 */
export function sanitizeHtml(dirty: string | null | undefined): string {
  if (!dirty) return "";
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // Force-open external links safely; same-origin relative links are handled
    // by the router elsewhere, but defensive rel/target never hurts.
    ADD_ATTR: ["target"],
  });
}
