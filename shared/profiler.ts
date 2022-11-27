export default function profiler () {
  const metrics = {
    total: [Date.now()],
  } as Record<string, [number, number?]>

  return {
    start: (name: string) => metrics[name] = [Date.now()],
    end: (name: string) => {
      metrics[name] && (metrics[name][1] = Date.now())
      metrics.total[1] = Date.now()
    },
    result: () => Object.fromEntries(
      Object.entries(metrics).map(([name, [start, end]]) => [name, end ? end - start : undefined]),
    ),
  }
}
