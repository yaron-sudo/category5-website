import { createClient } from '@sanity/client'

// Write client for import/seed scripts. Requires a real project + write token,
// both supplied via env (sanity/.env, gitignored). Never hardcode the token.
//
// Only call this when actually writing — dry runs must not need credentials.
export function getWriteClient() {
  const projectId = process.env.SANITY_PROJECT_ID
  const dataset = process.env.SANITY_DATASET || 'production'
  const token = process.env.SANITY_WRITE_TOKEN
  const apiVersion = process.env.SANITY_API_VERSION || '2024-01-01'

  const missing = []
  if (!projectId) missing.push('SANITY_PROJECT_ID')
  if (!token) missing.push('SANITY_WRITE_TOKEN')
  if (missing.length) {
    throw new Error(
      `Missing required env: ${missing.join(', ')}.\n` +
        'Create a Sanity project (npm create sanity@latest) and copy ' +
        'sanity/.env.example -> sanity/.env with the project id + a write token. ' +
        'Use --dry to preview without credentials.',
    )
  }

  return createClient({ projectId, dataset, token, apiVersion, useCdn: false })
}
