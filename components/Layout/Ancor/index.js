import React from 'react'
import PropTypes from 'prop-types'

class Ancor extends React.Component {

	constructor( props ){
		super( props )
		this.targetElement = null

		this.handleClick = this.handleClick.bind( this )
	}

	componentDidMount(){
		this.targetElement = document.getElementById( this.props.id )
	}

	handleClick(){
		if( this.targetElement ){
			this.targetElement.scrollIntoView({
				behavior: 'smooth',
				block: 'start',
				inline: 'start'
			})
		}
	}

	render(){
		return (
			<>
				<button aria-controls={this.props.id} onClick={this.handleClick}>
					{this.props.children}
				</button>
				<style jsx>{`
					button {
						appearence: none;
						border: 0;
						padding: 0;
						margin-bottom: 10px;
						background: transparent;
						color: darkgreen;
						cursor: pointer;
						text-transform: uppercase;
					}

					button:hover {
						color: green;
					}
				`}</style>
			</>
		)
	}
}

Ancor.propTypes = {
	id: PropTypes.string,
	children: PropTypes.node
}

export default Ancor