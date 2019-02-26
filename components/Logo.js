/**
 * 
 */
import React from 'react'
import { i18n, Link, withNamespaces } from '../i18n'

/**
 * 
 */
class Logo extends React.Component {
	static async getInitialProps() {
		return {
			namespacesRequired: ['common']
		}
	}

	render(){
		const { t } = this.props

		return (
			<div className="logo">
				<Link href="/">
					<a>
						<img src="/static/images/logo.svg" alt={ t( 'name' ) } />
					</a>
				</Link>
			</div>
		)
	}
}

/**
 * 
 */
export default withNamespaces( 'common' )( Logo )