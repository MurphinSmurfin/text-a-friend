export const METHOD_IDS = [
  "share",
  "sms",
  "whatsapp",
  "instagram",
  "email",
] as const;
export type Method = (typeof METHOD_IDS)[number];

/** `prefills` means the link opens the chat with the line already typed; otherwise we copy it on tap. */
export const METHODS: Record<
  Method,
  {
    label: string;
    handleLabel: string;
    placeholder: string;
    input: "tel" | "email" | "text";
    prefills: boolean;
  }
> = {
  share: {
    label: "Any app (share sheet)",
    handleLabel: "",
    placeholder: "",
    input: "text",
    prefills: true,
  },
  sms: {
    label: "Messages (SMS)",
    handleLabel: "Phone number",
    placeholder: "555 123 4567",
    input: "tel",
    prefills: true,
  },
  whatsapp: {
    label: "WhatsApp",
    handleLabel: "Phone number",
    placeholder: "555 123 4567",
    input: "tel",
    prefills: true,
  },
  instagram: {
    label: "Instagram",
    handleLabel: "Username",
    placeholder: "@username",
    input: "text",
    prefills: false,
  },
  email: {
    label: "Email",
    handleLabel: "Email address",
    placeholder: "name@example.com",
    input: "email",
    prefills: true,
  },
};

export const isMethod = (v: unknown): v is Method =>
  typeof v === "string" && (METHOD_IDS as readonly string[]).includes(v);

/** Deep link that opens the chat, or the profile for Instagram. Null for the share sheet, which has no URL. */
export function link(
  method: Method,
  handle: string,
  text: string,
): string | null {
  const t = encodeURIComponent(text);
  switch (method) {
    case "sms":
      // ?& is the one separator both iOS and Android accept
      return `sms:${handle.replace(/[^\d+]/g, "")}?&body=${t}`;
    case "whatsapp":
      return `https://wa.me/${handle.replace(/\D/g, "")}?text=${t}`;
    case "instagram":
      return `https://www.instagram.com/${encodeURIComponent(handle.trim().replace(/^@/, ""))}/`;
    case "email":
      return `mailto:${handle.trim()}?body=${t}`;
    case "share":
      return null;
  }
}
