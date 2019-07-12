/**
 * 
 */
import Head from 'next/head'
import Layout from '../../components/Layout'
import { useState } from 'react'

/**
 * 
 */
const HexRgb = () => {

	const [hex, setHEX] = useState( '000000' )
	const [r, setR] = useState( 0 )
	const [g, setG] = useState( 0 )
	const [b, setB] = useState( 0 )

	/**
	 * RGB to HEX
	 */
	const rgb2hex = ( r, g, b ) => (
		( ( 1 << 24 ) + ( r << 16 ) + ( g << 8 ) + b ).toString( 16 ).slice( 1 )
	)

	/**
	 * HEX to RGB
	 */
	const hex2rgb = ( hex ) => {
		const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
		hex = hex.replace( shorthandRegex, function( m, r, g, b ) {
			return r + r + g + g + b + b
		})
	
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec( hex )
		return result ? {
			r: parseInt( result[ 1 ], 16 ),
			g: parseInt( result[ 2 ], 16 ),
			b: parseInt( result[ 3 ], 16 )
		} : null
	}

	const changeHEX = ( event ) => {
		const val = event.target.value
		if( event.target.value.length === 3 || event.target.value.length === 6 ){
			setR( hex2rgb( '#' + val ).r )
			setG( hex2rgb( '#' + val ).g )
			setB( hex2rgb( '#' + val ).b )
		}
		setHEX( val )
	}


	const changeR = ( event ) => {
		const val = event.target.value % 256
		setHEX( rgb2hex( val, g, b ) )
		setR( val )
	}

	const changeG = ( event ) => {
		const val = event.target.value % 256
		setHEX( rgb2hex( r, val, b ) )
		setG( val )
	}

	const changeB = ( event ) => {
		const val = event.target.value % 256
		setHEX( rgb2hex( r, g, val ) )
		setB( val )
	}

	return (
		<Layout>
			<Head>
				<title>HEX to RGB, RGB to HEX</title>
			</Head>

			<h1>HEX to RGB,<br />RGB to HEX</h1>

			<div>

				<p>
					HEX: #<input type="text" value={ hex } onChange={ changeHEX } style={{width: '8.5ch', padding: '0.5ch 1ch'}} /><br />
					
				</p>
				<p>
					R: <input type="range" min="0" max="255" value={ r } onChange={ changeR } /> <input type="text" value={ r } onChange={ changeR } style={{width: '5.5ch', padding: '0.5ch 1ch'}} /><br />
					G: <input type="range" min="0" max="255" value={ g } onChange={ changeG } /> <input type="text" value={ g } onChange={ changeG } style={{width: '5.5ch', padding: '0.5ch 1ch'}} /><br />
					B: <input type="range" min="0" max="255" value={ b } onChange={ changeB } /> <input type="text" value={ b } onChange={ changeB } style={{width: '5.5ch', padding: '0.5ch 1ch'}} />
				</p>
				<p>
					<span style={{
						backgroundColor: '#' + hex,
						color: '#' + rgb2hex( 255 - r, 255 - g, 255 - b ),
						display: 'inline-block',
						padding: '0.5ch 1ch'
					}}>color: #{ hex };</span>
					<br />
					<span style={{
						backgroundColor: '#' + hex,
						color: '#' + rgb2hex( 255 - r, 255 - g, 255 - b ),
						display: 'inline-block',
						padding: '0.5ch 1ch'
					}}>color: rgb( { r }, { g }, { b } );</span>
				</p>

				<style jsx>{`
					input {
						font-size: 1rem;
					}
				`}</style>
			</div>

		</Layout>
	)
}

/**
 * 
 */
export default HexRgb