import Head from 'next/head'

function SEO({ title }) {
  const description = process.env.siteDescription
  const keywords = process.env.siteKeywords
  const siteURL = process.env.siteUrl || ''
  const imagePath = process.env.siteImagePreviewUrl || ''
  const imagePreview = `${siteURL.replace(/\/$/, '')}/${imagePath.replace(/^\//, '')}`

  return (
    <Head>
      <meta charSet="utf-8" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="twitter:card" content="summary_large_image" key="twcard" />

      <meta property="og:url" content={siteURL} key="ogurl" />
      <meta property="og:image" content={imagePreview} key="ogimage" />
      <meta property="og:site_name" content={siteURL} key="ogsitename" />
      <meta property="og:title" content={title} key="ogtitle" />
      <meta property="og:description" content={description} key="ogdesc" />
      <title>{title}</title>

      <link rel="manifest" href="/manifest.json" />
      <link
        href="/icons/icon-16x16.png"
        rel="icon"
        type="image/png"
        sizes="16x16"
        purpose="any maskable"
      />
      <link
        href="/icons/icon-32x32.png"
        rel="icon"
        type="image/png"
        sizes="32x32"
        purpose="any maskable"
      />
      <link rel="apple-touch-icon" href="/icons/apple-icon.png"></link>
      <meta name="theme-color" content="#8C432B" />
    </Head>
  )
}

export default SEO
