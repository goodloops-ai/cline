import { create } from "xmlbuilder2"
import { JSDOM } from "jsdom"
let DOMParser: typeof globalThis.DOMParser
let XMLSerializer: typeof globalThis.XMLSerializer
let document: Document
let Node: typeof globalThis.Node

const dom = new JSDOM()
DOMParser = dom.window.DOMParser
document = dom.window.document
Node = dom.window.Node

const parser = new DOMParser()

export const XSON_SPEC = `XSON (XML Structured Object Notation) Format:
XSON is a simple XML-based format for representing structured data that can be reliably round-tripped between XML and JSON.
It is designed to handle multiline text and special characters gracefully without escaping issues.
Basic Structure:
- Each element has a "type" attribute indicating its data type
- String values should be wrapped in CDATA sections to preserve special characters and formatting
- Arrays use indexed <item> elements to maintain order
- Objects use named elements for properties
- the outermost <xson> tag is REQUIRED for proper parsing and acts as the root object

Supported Types:
- string: Text content wrapped in CDATA sections (recommended
- integer: Whole numbers
- float: Decimal numbers
- boolean: true/false values
- null: Empty elements with type="null"
- object: Contains named child elements
- array: Contains indexed <item> elements

Example:
<xson>
  <name type="string"><![CDATA[John Doe]]></name>
  <age type="integer">30</age>
  <scores type="array">
    <item index="0" type="float">85.5</item>
    <item index="1" type="float">92.0</item>
  </scores>
  <address type="object">
    <street type="string"><![CDATA[123 Main St]]></street>
    <city type="string"><![CDATA[Anytown]]></city>
  </address>
  <active type="boolean">true</active>
  <photo type="null"/>
</xson>

this will be converted to:

{
  "name": "John Doe",
  "age": 30,
  "scores": [85.5, 92.0],
  "address": {
    "street": "123 Main St",
    "city": "Anytown"
  },
  "active": true,
  "photo": null
}

Usage Notes:
- The outermost <xson> tag is REQUIRED for proper parsing and acts as the root object
- CDATA sections are RECOMMENDED for string values, especially for code or content with special characters
- Array indices must be sequential integers starting from 0
- Element names in objects must be valid XML tag names
- Invalid XML characters in element names are converted to underscores
- When embedded in other text, the parser will extract content between <xson> tags
`

/**
 * Unescapes XML entities in text content
 */
function unescapeXML(str: string): string {
	return str
		.replace(/[^\x00-\xFF]/g, "") // Remove non-Latin1 characters
		.replace(/&quot;/g, '"')
		.replace(/&apos;/g, "'")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&amp;/g, "&")
		.replace(/&#10;/g, "\n")
		.replace(/&#13;/g, "\r")
		.replace(/&#x0A;/g, "\n")
		.replace(/&#x0D;/g, "\r")
}

/**
 * Converts a JavaScript value to XSON format
 * @param value The value to convert
 * @param maxLength Optional maximum length for string values before truncation
 * @returns The XSON string
 */
export function toXSON(value: unknown, maxLength?: number): string {
	const builder = create({ version: "1.0", encoding: "UTF-8" })
	const xsonElement = builder.ele("xson").att("type", "object")

	function addElement(name: string, value: unknown, parentElement: any): any {
		// Ensure valid XML element name
		const elementName = name.replace(/[^a-zA-Z0-9-._]/g, "_").replace(/^[^a-zA-Z_]/, "_")

		const element = parentElement.ele(elementName)

		if (value === null || value === undefined) {
			element.att("type", "null")
			return element
		}

		switch (typeof value) {
			case "string":
				element.att("type", "string")
				if (value.length > 0) {
					let processedValue = value
					if (maxLength && value.length > maxLength) {
						processedValue = value.substring(0, maxLength) + "..."
					}
					// Sanitize string by removing control characters and invalid XML chars
					processedValue = processedValue
						.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // Remove control chars
						.replace(/\uFFFE|\uFFFF/g, "") // Remove BOM and non-chars

					try {
						// Always use CDATA for string values
						element.dat(processedValue)
					} catch (err) {
						console.error(`Error in CDATA for value:`, {
							original: value,
							processed: processedValue,
							error: (err as Error).message,
						})
						// Fallback to basic text if CDATA fails
						element.txt(processedValue)
					}
				}
				break

			case "number":
				element.att("type", Number.isInteger(value) ? "integer" : "float").txt(String(value))
				break

			case "boolean":
				element.att("type", "boolean").txt(String(value))
				break

			case "object":
				if (Array.isArray(value)) {
					element.att("type", "array")
					value.forEach((item, index) => {
						const itemElement = element.ele("item")
						itemElement.att("index", String(index))

						if (item === null || item === undefined) {
							itemElement.att("type", "null")
						} else if (typeof item === "string") {
							itemElement.att("type", "string")
							if (item.length > 0) {
								let processedItem = item
								if (maxLength && item.length > maxLength) {
									processedItem = item.substring(0, maxLength) + "..."
								}
								// Sanitize string by removing control characters and invalid XML chars
								processedItem = processedItem
									.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // Remove control chars
									.replace(/\uFFFE|\uFFFF/g, "") // Remove BOM and non-chars

								try {
									// Always use CDATA for string values
									itemElement.dat(processedItem)
								} catch (err) {
									console.error(`Error in CDATA for array item:`, {
										original: item,
										processed: processedItem,
										error: (err as Error).message,
									})
									// Fallback to basic text if CDATA fails
									itemElement.txt(processedItem)
								}
							}
						} else {
							addElement("value", item, itemElement)
						}
					})
				} else {
					element.att("type", "object")
					for (const [key, val] of Object.entries(value)) {
						addElement(key, val, element)
					}
				}
				break

			default:
				element.att("type", "null")
		}

		return element
	}

	// Add all properties directly to xson element
	if (typeof value === "object" && value !== null && !Array.isArray(value)) {
		for (const [key, val] of Object.entries(value)) {
			addElement(key, val, xsonElement)
		}
	} else {
		// If value is not an object, treat xson as a wrapper
		addElement("value", value, xsonElement)
	}

	// Remove only XML declaration, keep xson tags as they are required
	let result = builder.end({ prettyPrint: true })
	result = result.replace(/^<\?xml[^>]+\?>\s*/, "")
	return result.trim()
}

/**
 * Converts XSON format back to JavaScript values
 * @param xsonString The XSON string to parse
 * @returns The parsed JavaScript value
 */
export function fromXSON(xsonString: string): unknown {
	// Extract XSON content from surrounding text
	const xsonMatch = xsonString.match(/<xson[^>]*>[\s\S]*<\/xson>/)
	if (!xsonMatch) {
		throw new Error("XSON content must be wrapped in <xson> tags")
	}
	const xsonContent = xsonMatch[0]

	// Parse the XML content
	const xmlDoc = parser.parseFromString(xsonContent, "text/xml")

	// Check for parsing errors
	const parseError = xmlDoc.getElementsByTagName("parsererror")
	if (parseError.length > 0) {
		console.error("Full XML content:", xsonContent)
		throw new Error("XML parsing error: " + parseError[0].textContent)
	}

	function parseElement(element: Element): unknown {
		const type = element.getAttribute("type")

		// Special case for elements without type attribute - treat as string
		if (!type) {
			// Check for CDATA sections
			const cdataNodes = Array.from(element.childNodes).filter((node) => node.nodeType === Node.CDATA_SECTION_NODE)
			if (cdataNodes.length > 0) {
				// Return raw CDATA content
				return (cdataNodes[0] as CDATASection).data
			}
			// Return regular text content
			return element.textContent
		}

		// Handle null/undefined
		if (type === "null") {
			return null
		}

		// Handle empty elements
		if (element.childNodes.length === 0) {
			if (type === "object") {
				return {}
			}
			if (type === "array") {
				return []
			}
			if (type === "string") {
				return ""
			}
			if (type === "integer" || type === "float") {
				return null
			}
			if (type === "boolean") {
				return null
			}
			return null
		}

		switch (type) {
			case "string": {
				// Get raw content including CDATA if present
				const content = Array.from(element.childNodes)
					.map((node) => {
						if (node.nodeType === Node.CDATA_SECTION_NODE) {
							return (node as CDATASection).data
						}
						return node.textContent
					})
					.join("")

				// If content has HTML-style entities or is from CDATA, return as-is
				if (
					element.getElementsByTagName("![CDATA[").length > 0 ||
					content.includes("&lt;") ||
					content.includes("&gt;") ||
					content.includes("&amp;") ||
					content.includes("&quot;") ||
					content.includes("&apos;")
				) {
					return content
				}
				// Otherwise unescape normally
				return unescapeXML(content).trim()
			}

			case "integer":
				return parseInt(element.textContent || "", 10)

			case "float":
				return parseFloat(element.textContent || "")

			case "boolean":
				return (element.textContent || "").toLowerCase() === "true"

			case "array": {
				const items = Array.from(element.children)
				// Sort items by index to ensure proper order
				items.sort((a, b) => {
					const indexA = parseInt(a.getAttribute("index") || "0", 10)
					const indexB = parseInt(b.getAttribute("index") || "0", 10)
					return indexA - indexB
				})

				return items.map((item) => {
					const itemType = item.getAttribute("type")

					if (itemType === "string") {
						return unescapeXML(item.textContent || "")
					} else if (itemType === "null") {
						return null
					} else {
						return item.children.length === 1 && item.children[0].tagName === "value"
							? parseElement(item.children[0])
							: parseElement(item)
					}
				})
			}

			case "object": {
				const obj: Record<string, unknown> = {}
				Array.from(element.children).forEach((child) => {
					obj[child.tagName] = parseElement(child)
				})
				return obj
			}

			default:
				return null
		}
	}

	// Parse the xson element directly as the root object
	const rootElement = xmlDoc.documentElement
	return parseElement(rootElement)
}
