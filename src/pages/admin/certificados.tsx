import Head from 'next/head'
import { AdminGuard } from 'components/admin-guard'

import CertificatePage from '../certi2026'

const Page = (): JSX.Element => (
  <AdminGuard permission='certificates.manage'>
    <Head>
      <title>Certificados | Administración HM</title>
      <meta name='robots' content='noindex,nofollow' />
    </Head>
    <CertificatePage />
  </AdminGuard>
)

export default Page
