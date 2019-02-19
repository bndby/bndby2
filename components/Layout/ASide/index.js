/**
 * 
 */
import PropTypes from 'prop-types'
import Contacts from '../../Contacts'

/**
 * 
 */
const ASide = ( props ) => (
	<aside>
		<h1>Бондаренко Юрий</h1>
		{props.children}
		<Contacts />
		<style jsx>{`
			aside {
				display: flex;
				flex-direction: column;
				align-items: flex-end;
			}
			
			h1 {
				font-size: 1.5rem;
			}
		`}</style>
	</aside>
)

/**
 * 
 */
ASide.propTypes = {
	children: PropTypes.node
}

/**
 * 
 */
export default ASide