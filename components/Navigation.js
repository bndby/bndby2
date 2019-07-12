/**
 *
 */
import React from 'react'
import { i18n, Link, withNamespaces } from '../i18n'

import './navigation.css'

/**
 *
 */
class Navigation extends React.Component {
	static async getInitialProps() {
		return {
			namespacesRequired: ['common']
		}
	}

	render() {
		const { t } = this.props

		return (
			<div className="navigation">
				<ul>
					<li>
						<a
							className="navigation__email"
							href="mailto:info@bnd.by"
						>
							info@bnd.by
						</a>
					</li>
					<li>
						<a
							className="navigation__telegram"
							href="https://t.me/bndby"
						>
							@bndby
						</a>
					</li>
					<li>
						<a
							className="navigation__github"
							href="https://github.com/bndby"
						>
							/bndby
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
export default withNamespaces('common')(Navigation)
