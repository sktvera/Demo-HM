import type { PropsWithChildren } from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Box, Text } from 'components'
import { hasPermission, isAuthenticated } from 'platform-storage'
import type { Permission } from 'platform-storage'

export const AdminGuard = ({
  children,
  permission = 'dashboard.view',
}: PropsWithChildren<{ permission?: Permission }>): JSX.Element => {
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) {
      void router.replace(`/admin/login?next=${encodeURIComponent(router.asPath)}`)
      return
    }
    if (!hasPermission(permission)) {
      void router.replace('/admin?forbidden=1')
      return
    }
    setAllowed(true)
  }, [permission, router])

  if (!allowed) {
    return (
      <Box css={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <Text css={{ color: '$shade300' }}>Validando acceso seguro…</Text>
      </Box>
    )
  }

  return <>{children}</>
}
