/**
 * 
 */
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../components/Layout'
import ASide from '../components/Layout/ASide'
import Main from '../components/Layout/Main'
import Player from '../components/Swgoh/Player'

/**
 * 
 */
const Swgoh = ( props ) => {

	const me = '644892133'

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
				<ul>
					<li>Player name: {props.data.name}</li>
					<li>Power: {props.data.galactic_power}</li>
					<li>Guild name: {props.data.guild_name}</li>
				</ul>
			</Main>
		</Layout>
	)
}

Swgoh.getInitialProps = async function() {
	const res = await fetch('https://swgoh.gg/api/player/644892133/')
	const data = await res.json()
	return {
	  data: data.data
	}
}

export default Swgoh