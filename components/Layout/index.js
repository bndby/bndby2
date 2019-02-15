/**
 * 
 */
import Head from 'next/head'
import Header from '../Header'
import Footer from '../Footer'

/**
 * 
 */
import './layout.css'

/**
 * 
 * @param {*} props 
 */
const Layout = ( props ) => (
	<>
		<Head>
			<title>...Title...</title>
			<meta name="viewport" content="initial-scale=1.0, width=device-width" />
      	</Head>
		<Header />
		<div className="layout">
			{props.children}
		</div>
		<Footer />
	</>
)

/**
 * 
 */
export default Layout