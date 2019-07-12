/**
 *
 */
import React from 'react'
import PropTypes from 'prop-types'
import { Link, withTranslation } from '../i18n'
import { default as Link2 } from 'next/link'

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

	render() {
		const { t } = this.props

		return (
			<footer className="footer">
				<Link href="/tests">
					<a>{t('tests')}</a>
				</Link>
				<Link2 href="/notes">
					<a>Заметки (RU)</a>
				</Link2>
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

export default withTranslation('common')(Footer)
