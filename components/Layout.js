/**
 * 
 */
import PropTypes from 'prop-types'
import Logo from './Logo'
import Navigation from './Navigation'
import { withNamespaces } from '../i18n'
import LanguageSelector from './LanguageSelector'

import './layout.css'

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
		<div className="layout__content">
			{props.children}
		</div>
		<div className="layout__navigation">
			<Navigation />
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

