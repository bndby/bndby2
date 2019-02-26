/**
 * 
 */
import React from 'react'
import PropTypes from 'prop-types'
import { withNamespaces } from '../i18n'

/**
 * 
 */
class Error extends React.Component {
	static getInitialProps({ res, err }) {
		const statusCode = res ? res.statusCode : err ? err.statusCode : null
		return { 
			statusCode,
			namespacesRequired: ['common']
		}
	}

	render() {
		return (
			<p>
				{this.props.statusCode ? `An error ${this.props.statusCode} occurred on server` : 'An error occurred on client'}
			</p>
		)
	}
}

/**
 * 
 */
Error.propTypes = {
	statusCode: PropTypes.number
}

export default withNamespaces( 'common' )( Error )