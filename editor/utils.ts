import { Type, isReference } from "../lib/apg/schema"

export function setArrayIndex<T>(array: T[], element: T, index: number): T[] {
	const result = [...array]
	result[index] = element
	return result
}

export const uriPlaceholder = "http://..."
export const namePlaceholder = "name or http://..."

const baseURL = "https://regexper.com/#"

export const namespacePattern = /^[a-z0-9]+:[a-zA-Z_\-\/\.]+(?:#|\/)$/
export const namespacePatternURL =
	baseURL + encodeURIComponent(namespacePattern.source)

const propertyPattern = /^[a-z0-9]+:[a-zA-Z_\-\/\.]+(?:#|\/)[a-zA-Z_\-\/\.]+$/
export const propertyPatternURL =
	baseURL + encodeURIComponent(propertyPattern.source)

const namePattern = /^[a-zA-Z_\-\/\.]+$/
export const namePatternURL =
	baseURL + encodeURIComponent(propertyPattern.source)

export const validateKey = (input: string, namespace: null | string) =>
	propertyPattern.test(input) ||
	(namespace !== null &&
		namespacePattern.test(namespace) &&
		namePattern.test(input))

export function checkDuplicate(
	id: string,
	key: string,
	labels: Map<string, string>
) {
	for (const [labelId, labelKey] of labels) {
		if (labelId === id) {
			return false
		} else if (labelKey === key) {
			return true
		}
	}
	return false
}

export function findError(type: Type, namespace: null | string): null | Error {
	if (isReference(type)) {
		return null
	} else if (type.type === "product") {
		const componentKeys: Set<string> = new Set()
		for (const component of type.components) {
			if (!validateKey(component.key, namespace)) {
				return new Error("Invalid product component key")
			} else if (componentKeys.has(component.key)) {
				return new Error("Duplicate product component key")
			} else {
				const error = findError(component.value, namespace)
				if (error !== null) {
					return error
				}
			}
		}
	}
	return null
}
