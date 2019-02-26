/**
 * 
 */
import React from 'react'
import { i18n, Link, withNamespaces } from '../i18n'

/**
 * 
 */
class Navigation extends React.Component {
	static async getInitialProps() {
		return {
			namespacesRequired: ['common']
		}
	}

	render(){
		const { t } = this.props

		return (
			<div className="navigation">
                <ul>
                    <li>
                        <a href="mailto:info@bnd.by">
                            info@bnd.by
                        </a>
                    </li>
                </ul>
			</div>
		)
	}
}

/**
 * 
 */
export default withNamespaces( 'common' )( Navigation )