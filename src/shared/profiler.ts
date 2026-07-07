interface Metric {
  end?: number
  start: number
}

export interface Profiler {
  end(name: string): void
  measure<T>(name: string, callback: () => Promise<T> | T): Promise<T>
  result(): Record<string, number | undefined>
  start(name: string): void
  toServerTimingHeader(): string
}

export default function profiler(): Profiler {
  const metrics = {
    total: { start: now() },
  } as Record<string, Metric>

  return {
    start: (name: string) => {
      metrics[name] = { start: now() }
    },
    end: (name: string) => {
      if (metrics[name]) {
        metrics[name].end = now()
      }
    },
    measure: async <T>(name: string, callback: () => Promise<T> | T) => {
      metrics[name] = { start: now() }

      try {
        return await callback()
      } finally {
        metrics[name].end = now()
      }
    },
    result: () =>
      Object.fromEntries(
        Object.entries(metrics).map(([name, { start, end }]) => [
          name,
          end ? end - start : undefined,
        ]),
      ),
    toServerTimingHeader: () =>
      Object.entries(metrics)
        .flatMap(([name, { start, end }]) =>
          end ? [`${toServerTimingName(name)};dur=${(end - start).toFixed(1)}`] : [],
        )
        .join(', '),
  }
}

function now(): number {
  return globalThis.performance?.now() ?? Date.now()
}

function toServerTimingName(name: string): string {
  return name.replaceAll(/[^!#$%&'*+\-.^_`|~0-9A-Za-z]/g, '_')
}
