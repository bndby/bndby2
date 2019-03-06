/**
 * 
 */
import React from 'react'
import { i18n, Link, withNamespaces } from '../i18n'

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
export default withNamespaces( 'common' )( Footer )