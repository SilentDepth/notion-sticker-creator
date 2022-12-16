import { createHash } from 'node:crypto'

export function md5 (input: string): string {
  return createHash('md5').update(input).digest('hex')
}
