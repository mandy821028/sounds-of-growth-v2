import sanitizeHtml from "sanitize-html";

export function sanitizePlainText(input: string): string {
	const cleaned = sanitizeHtml(input ?? "", { allowedTags: [], allowedAttributes: {} }).trim();
	return cleaned;
}

export function sanitizeRichHtml(input: string): string {
	return sanitizeHtml(input ?? "", {
		allowedTags: [
			"p",
			"br",
			"b",
			"i",
			"em",
			"strong",
			"u",
			"ul",
			"ol",
			"li",
			"a",
			"blockquote",
			"pre",
			"code",
			"h1",
			"h2",
			"h3",
		],
		allowedAttributes: {
			a: ["href", "name", "target", "rel"],
		},
		allowedSchemes: ["http", "https", "mailto"],
		allowedSchemesAppliedToAttributes: ["href"],
		allowProtocolRelative: false,
		transformTags: {
			a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer nofollow", target: "_blank" }, true),
		},
	});
}


