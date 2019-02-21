/**
 * 
 */
import PropTypes from 'prop-types'
import StickyBox from 'react-sticky-box'
import Contacts from '../../Contacts'

/**
 * 
 */
import './aside.css'

/**
 * 
 */
const ASide = ( props ) => (
	<aside>
		<StickyBox offsetTop={0} offsetBottom={20}>
			<div className="aside">
				<div className="aside__inner">
					{props.children}
				</div>
				<div className="aside__contacts">
					<Contacts />
				</div>
			</div>
		</StickyBox>
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