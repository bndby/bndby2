/**
 * 
 */
//import { useState, useEffect } from 'react'
//import PropTypes from 'prop-types'
import fetch from 'isomorphic-unfetch'

/**
 * 
 */
const Player = ( props ) => (
	<ul>
		<li>Name: { props.player }</li>
	</ul>
)

/**
 * 
 */
Player.getInitialProps = async function() {
	const res = await fetch('https://swgoh.gg/api/player/644892133/')
	const data = await res.json()
  
	console.log(`Show data fetched. Count: ${data.length}`)
  
	return {
	  shows: data
	}
  }
/*
Player.getInitialProps = async function() {
	console.log( 'Initial' )
	const res = await fetch( 'https://swgoh.gg/api/player/644892133/', {
		credentials: 'include'
	} )
	const data = await res.json()
  
	console.log(`Show data fetched. Count: ${data.length}`)
  
	return {
		player: data.data
	}
}
*/
/**
 * 
 */
/*Player.propTypes = {
	ally_code: PropTypes.string
}*/

/**
 * 
 */
export default Player