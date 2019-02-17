/**
 * 
 */
import Menu from '../Menu'

/**
 * 
 */
const Footer = () => (
	<div className="footer">
		<div className="footer__copyright">
			&copy; 2019, Бондаренко Юрий
		</div>
		<div className="footer__nav">
			<Menu />
		</div>
		<style jsx>{`
			.footer {
				padding: 0.5rem 1rem;
				background-color: #ccc;
				display: flex;
				justify-content: space-between;
			}
		`}</style>
	</div>
)

/**
 * 
 */
export default Footer