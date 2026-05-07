export type QueryArgs = Record<string, string>
export type ParsedQuery = [type: string | undefined, args: QueryArgs]

export function parseQuery(text: string): ParsedQuery | null {
  if (!text) return null

  const typeRe = /^\$(\w+)(?:\s+|$)/y
  const [, type] = typeRe.exec(text) ?? []
  const input = text.slice(typeRe.lastIndex)

  if (input.startsWith('#')) {
    return input.length > 2 && /\$r?$/.test(input) ? [type, { 0: input }] : null
  }

  const segments = input.split(/((?<!\\)\s)+/).filter(segment => !/^\s*$/.test(segment))

  const args: QueryArgs = {}
  const positional: string[] = []

  for (const segment of segments) {
    const { name, value } = /^(?:(?<name>\w+)=)?(?<value>.+)$/.exec(segment)?.groups ?? {}

    if (name) {
      args[name] = value
    } else if (value) {
      positional.push(value)
    }
  }

  Object.assign(args, positional)
  return [type, args]
}
