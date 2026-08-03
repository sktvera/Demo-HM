import { asset } from 'paths'
// _document.tsx
import { Html, Head, Main, NextScript } from 'next/document'
import { getCssText } from 'stitches.config'

export default function Document(): JSX.Element {
  return (
    <Html lang='es'>
      <Head>
        {/* SEO básico */}
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <meta
          name='description'
          content='Tu descripción aquí para SEO y redes sociales'
        />
        <meta name='theme-color' content='#000000' />

        {/* Stitches CSS */}
        <style
          id='stitches'
          // tip explícito para cumplir reglas estrictas
          dangerouslySetInnerHTML={{ __html: getCssText() }}
        />

        {/* Favicon */}
        <link rel='shortcut icon' href={asset('/images/favicon.ico')} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
