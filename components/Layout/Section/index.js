/**
 * 
 */
import PropTypes from 'prop-types'

/**
 * 
 */
const Section = ( props ) => (
	<section id={props.id}>
		{props.children}
	</section>
)

/**
 * 
 */
Section.propTypes = {
	children: PropTypes.node,
	id: PropTypes.string
}

/**
 * 
 */
export default Section