/**
 * 
 */
import React from 'react'
import PropTypes from 'prop-types'
import { Link, withNamespaces } from '../i18n'

import './footer.css'

/**
 * 
 */
class Footer extends React.Component {
	static async getInitialProps() {
		return {
			namespacesRequired: ['common']
		}
	}

	render(){
		const { t } = this.props

		return (
			<footer className="footer">
				<Link href="/tests">
					<a>{ t( 'tests' ) }</a>
				</Link>
				<Link href="/blog">
					<a>{ t( 'blog' ) }</a>
				</Link>
			</footer>
		)
	}
}

/**
 * 
 */
Footer.propTypes = {
	t: PropTypes.func
}

export default withNamespaces( 'common' )( Footer )