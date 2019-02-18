// _document is only rendered on the server side and not on the client side
// Event handlers like onClick can't be added to this file

// ./pages/_document.js
import Document, { Head, Main, NextScript } from 'next/document'

/**
 * 
 */
class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <html>
        <Head>
			<style>{`
			  	body {
					margin: 0
				}
			`}</style>
        </Head>
        <body className="custom_class">
			<Main />
			<NextScript />
        </body>
      </html>
    )
  }
}

export default MyDocument