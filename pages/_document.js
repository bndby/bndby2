// _document is only rendered on the server side and not on the client side
// Event handlers like onClick can't be added to this file

// ./pages/_document.js
import Document, { Head, Main, NextScript } from 'next/document'
import { GA_TRACKING_ID } from '../lib/gtag'
import {default as Head2} from 'next/head'

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

					<script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`} />
					<script
						dangerouslySetInnerHTML={{
							__html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}');
          `
						}}
					/>

					<link rel="apple-touch-icon" sizes="180x180" href="/static/favicon/apple-touch-icon.png" />
					<link rel="icon" type="image/png" sizes="32x32" href="/static/favicon/favicon-32x32.png" />
					<link rel="icon" type="image/png" sizes="16x16" href="/static/favicon/favicon-16x16.png" />
					<link rel="manifest" href="/static/favicon/site.webmanifest" />
					<link rel="mask-icon" href="/static/favicon/safari-pinned-tab.svg" color="#5bbad5" />
					<link rel="shortcut icon" href="/static/favicon/favicon.ico" />
					<meta name="msapplication-TileColor" content="#ffffff" />
					<meta name="msapplication-config" content="/static/favicon/browserconfig.xml" />
					<meta name="theme-color" content="#ffffff" />

					<meta name="viewport" content="initial-scale=1.0, width=device-width" />
				</Head>
				<Head2>
					<link rel="canonical" href={ canonical } key="canonical" />
				</Head2>
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