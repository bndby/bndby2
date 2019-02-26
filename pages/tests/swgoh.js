/**
 * 
 */
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../../components/Layout'
import ASide from '../../components/Layout/ASide'
import Main from '../../components/Layout/Main'
import { useState, useEffect } from 'react'

/**
 * 
 */
const Swgoh = ( props ) => {

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
			<ASide>
				<Link href="/">
					<a>Назад</a>
				</Link>
				<h1>SWGOH 644-892-133</h1>
			</ASide>
			<Main>
				{data.name}
			</Main>
		</Layout>
	)
}

/**
 * 
 */
export default Swgoh