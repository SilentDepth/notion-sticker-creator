import { isNotFound } from '@tanstack/react-router'
import { expect, test } from 'vite-plus/test'
import { assertDevRouteEnabled, isDevRouteEnabled } from '@/routes/dev/-guard'

test('enables dev routes only in development builds', () => {
  expect(isDevRouteEnabled({ DEV: true })).toBe(true)
  expect(isDevRouteEnabled({ DEV: false })).toBe(false)
})

test('throws a router not-found error outside development builds', () => {
  try {
    assertDevRouteEnabled({ DEV: false })
    throw new Error('Expected dev route guard to throw')
  } catch (error) {
    expect(isNotFound(error)).toBe(true)
  }
})
