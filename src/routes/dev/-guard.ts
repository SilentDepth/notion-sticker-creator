import { notFound } from '@tanstack/react-router'

interface DevRouteEnv {
  DEV: boolean
}

export function isDevRouteEnabled(env: DevRouteEnv = import.meta.env): boolean {
  return env.DEV
}

export function assertDevRouteEnabled(env: DevRouteEnv): void {
  if (!isDevRouteEnabled(env)) {
    throw notFound()
  }
}

export function requireDevRoute(): void {
  assertDevRouteEnabled(import.meta.env)
}
