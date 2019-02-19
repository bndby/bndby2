/**
 * 
 */
import PropTypes from 'prop-types'

/**
 * 
 */
const Main = ( props ) => (
	<main>
		{props.children}
	</main>
)

/**
 * 
 */
Main.propTypes = {
	children: PropTypes.node
}

/**
 * 
 */
export default Main