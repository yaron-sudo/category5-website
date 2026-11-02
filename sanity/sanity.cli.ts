import { defineCliConfig } from 'sanity/cli'

// Project ID + dataset come from env so no secrets are committed.
// Populate sanity/.env (gitignored) from sanity/.env.example after running
// `npm create sanity@latest` (or `npx sanity init`) to obtain a project id.
export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_PROJECT_ID || 'REPLACE_WITH_PROJECT_ID',
    dataset: process.env.SANITY_DATASET || 'production',
  },
  // Hosted Studio hostname → https://category5.sanity.studio
  studioHost: 'category5',
})
