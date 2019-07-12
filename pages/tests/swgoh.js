/**
 * 
 */
import Head from 'next/head'
import Layout from '../../components/Layout'
import { useState, useEffect } from 'react'

/**
 * 
 */
const Swgoh = () => {

	const me = '644892133'

	const [data, setData] = useState( {} )

	useEffect( () => {
		const proxyurl = 'https://cors-anywhere.herokuapp.com/'
		fetch( `${proxyurl}https://swgoh.gg/api/player/${ me }/`).then( response => ( response.json() ) ).then( data => {
			setData( data.data )
		})

	}, [ data ] )

	return (
		<Layout>
			<Head>
				<title>SWGOH</title>
			</Head>

			{data.name}

		</Layout>
	)
}

/**
 * 
 */
export default Swgoh