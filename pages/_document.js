// _document is only rendered on the server side and not on the client side
// Event handlers like onClick can't be added to this file

// ./pages/_document.js
import Document, { Head, Main, NextScript } from 'next/document'

/**
 * 
 */
class MyDocument extends Document {
	static async getInitialProps( ctx ) {
		const initialProps = await Document.getInitialProps( ctx )
		return {
			namespacesRequired: ['common'],
			...initialProps
		}
	}

	render() {
		const lang = this.props.__NEXT_DATA__.props.initialLanguage
		const page = this.props.__NEXT_DATA__.page
		const canonical = `https://bnd.by${ lang === 'en' ? '' : '/' + lang }${ page }`

		return (
			<html lang={ lang }>
				<Head>
					<meta name="viewport" content="initial-scale=1.0, width=device-width" />
					<link rel="canonical" href={ canonical } />
				</Head>
				<body>
					<Main />
					<NextScript />
				</body>
			</html>
		)
	}
}

/**
 * 
 */
export default MyDocument