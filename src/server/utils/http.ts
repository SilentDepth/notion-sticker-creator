/**
 * Create a 204 response
 */
export function empty(): Response {
  return new Response(null, { status: 204 })
}
