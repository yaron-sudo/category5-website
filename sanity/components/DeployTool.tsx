import { useCallback, useState } from 'react'
import { Button, Card, Code, Container, Flex, Stack, Text } from '@sanity/ui'
import { RocketIcon } from '@sanity/icons'
import type { Tool } from 'sanity'

// "Publish to site" tool: the live site is statically built, so publishing a
// document does NOT change the site until a rebuild runs. This button hits a
// Vercel Deploy Hook (SANITY_STUDIO_DEPLOY_HOOK) to trigger that rebuild on
// demand. A Sanity→Vercel webhook (see repo docs) can automate the same thing
// on every publish; this tool is the manual/visible fallback editors trust.
const DEPLOY_HOOK = process.env.SANITY_STUDIO_DEPLOY_HOOK

function DeployToolComponent() {
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle')

  const trigger = useCallback(async () => {
    if (!DEPLOY_HOOK) return
    setState('busy')
    try {
      // no-cors: deploy hooks don't send CORS headers; an opaque response
      // still means the POST fired and the build was queued.
      await fetch(DEPLOY_HOOK, { method: 'POST', mode: 'no-cors' })
      setState('done')
    } catch {
      setState('error')
    }
  }, [])

  return (
    <Container width={1} padding={4}>
      <Stack space={4}>
        <Card padding={4} radius={3} shadow={1}>
          <Stack space={4}>
            <Text size={2} weight="semibold">
              פרסום לאתר החי
            </Text>
            <Text size={1} muted>
              האתר נבנה סטטית: אחרי פרסום מסמכים, לחצו כאן כדי לבנות ולפרסם את הגרסה המעודכנת.
              הבנייה אורכת כ־2–3 דקות.
            </Text>
            {DEPLOY_HOOK ? (
              <Flex gap={3} align="center">
                <Button
                  icon={RocketIcon}
                  text={state === 'busy' ? 'שולח…' : 'בנה ופרסם עכשיו'}
                  tone="primary"
                  disabled={state === 'busy'}
                  onClick={trigger}
                />
                {state === 'done' && (
                  <Text size={1} muted>
                    ✓ הבנייה הופעלה — האתר יתעדכן בעוד כ־2–3 דקות.
                  </Text>
                )}
                {state === 'error' && (
                  <Text size={1} muted>
                    שגיאה בהפעלת הבנייה — נסו שוב או בדקו את ה־Deploy Hook.
                  </Text>
                )}
              </Flex>
            ) : (
              <Stack space={3}>
                <Text size={1} muted>
                  לא מוגדר Deploy Hook. צרו אחד ב־Vercel (Settings → Git → Deploy Hooks) והגדירו:
                </Text>
                <Code size={1}>SANITY_STUDIO_DEPLOY_HOOK=https://api.vercel.com/v1/integrations/deploy/…</Code>
              </Stack>
            )}
          </Stack>
        </Card>
      </Stack>
    </Container>
  )
}

export const deployTool: Tool = {
  name: 'deploy',
  title: 'פרסום לאתר',
  icon: RocketIcon,
  component: DeployToolComponent,
}
