import { useMemo, useState } from 'react'
import { Button, Card, Flex, Text } from '@sanity/ui'
import { MobileDeviceIcon } from '@sanity/icons'
import type { Tool } from 'sanity'

// Multi-device preview: the site in an iframe at exact device widths —
// mobile / tablet / laptop / desktop — without leaving the Studio.
// Complements עריכה חיה (which has a single mobile toggle).
const ORIGIN = process.env.SANITY_STUDIO_PREVIEW_ORIGIN || 'http://localhost:4321'

const DEVICES = [
  { id: 'mobile', label: 'מובייל', w: 390, h: 844 },
  { id: 'tablet', label: 'טאבלט', w: 768, h: 1024 },
  { id: 'laptop', label: 'לפטופ', w: 1024, h: 768 },
  { id: 'desktop', label: 'דסקטופ', w: 1440, h: 900 },
  { id: 'full', label: 'רוחב מלא', w: 0, h: 0 },
] as const

function PreviewDevicesComponent() {
  const [device, setDevice] = useState<(typeof DEVICES)[number]>(DEVICES[4])
  const [path, setPath] = useState('/')
  const src = useMemo(() => `${ORIGIN}${path}`, [path])

  return (
    <Flex direction="column" style={{ height: '100%' }}>
      <Card padding={3} borderBottom>
        <Flex align="center" gap={2} wrap="wrap">
          {DEVICES.map((d) => (
            <Button
              key={d.id}
              text={d.w ? `${d.label} · ${d.w}` : d.label}
              mode={device.id === d.id ? 'default' : 'ghost'}
              tone={device.id === d.id ? 'primary' : 'default'}
              onClick={() => setDevice(d)}
            />
          ))}
          <Button text="דף הבית" mode="bleed" onClick={() => setPath('/')} />
          <Text size={1} muted>
            {src}
          </Text>
        </Flex>
      </Card>
      <Card flex={1} tone="transparent" style={{ overflow: 'auto', background: '#f1f0ee' }}>
        <Flex align="flex-start" justify="center" padding={device.w ? 4 : 0} style={{ minHeight: '100%' }}>
          <iframe
            title="preview"
            src={src}
            style={{
              width: device.w ? device.w : '100%',
              height: device.w ? device.h : '100%',
              minHeight: device.w ? undefined : 'calc(100vh - 120px)',
              border: device.w ? '1px solid #d8d5d0' : 'none',
              borderRadius: device.w ? 18 : 0,
              boxShadow: device.w ? '0 12px 40px -12px rgba(0,0,0,.25)' : 'none',
              background: '#fff',
            }}
          />
        </Flex>
      </Card>
    </Flex>
  )
}

export const previewDevicesTool: Tool = {
  name: 'preview-devices',
  title: 'תצוגה במסכים',
  icon: MobileDeviceIcon,
  component: PreviewDevicesComponent,
}
