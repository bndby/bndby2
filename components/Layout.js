/**
 * 
 */
import PropTypes from 'prop-types'
import Logo from './Logo'
import Navigation from './Navigation'
import Footer from './Footer'
import { withNamespaces } from '../i18n'
import LanguageSelector from './LanguageSelector'
import Router from 'next/router'
import * as gtag from '../lib/gtag'

import './layout.css'

Router.events.on('routeChangeComplete', url => gtag.pageview(url))

/**
 * 
 * @param {*} props 
 */
const Layout = ( props ) => (
	<div className="layout">
		<div className="layout__logo">
			<Logo />
			<LanguageSelector />
		</div>
		<div className="layout__navigation">
			<Navigation />
		</div>
		<div className="layout__content">
			{props.children}
			<hr />
			<Footer />
		</div>
	</div>
)

/**
 * 
 */
Layout.propTypes = {
	children: PropTypes.node
}

export default withNamespaces( 'common' )( Layout )

