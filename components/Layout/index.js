/**
 * 
 */
import PropTypes from 'prop-types'
import Head from 'next/head'

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
		<div className="layout">
			{props.children}
		</div>
	</>
)

/**
 * 
 */
export default Layout

Layout.propTypes = {
	children: PropTypes.node
}