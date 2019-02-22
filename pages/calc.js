/**
 * 
 */
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../components/Layout'
import ASide from '../components/Layout/ASide'
import Main from '../components/Layout/Main'
import { useState, useEffect } from 'react'

/**
 * 
 */
export default () => {

	const [byn, setBYN] = useState( 1 )
	const [usd, setUSD] = useState( 1 )
	const [ex, setEx] = useState( 1 )

	useEffect( () => {
		fetch( 'http://www.nbrb.by/API/ExRates/Rates/145' )
			.then( ( data ) => data.json() )
			.then( ( data ) => {
				setEx( data.Cur_OfficialRate )
				setUSD( byn / ex )
			})
	}, [ ex ] )

	const changeBYN = ( event ) => {
		setBYN( event.target.value )
		setUSD( event.target.value / ex )
	}

	const changeUSD = ( event ) => {
		setUSD( event.target.value )
		setBYN( event.target.value * ex )
	}

	return (
		<Layout>
			<Head>
				<title>Калькулятор</title>
			</Head>
			<ASide>
				<Link href="/">
					<a>Назад</a>
				</Link>
				<h1>Калькулятор</h1>
			</ASide>
			<Main>
				<div>
					<p>Курс: {ex}</p>
					<p>
						BYN: <input type="text" value={byn} onChange={ changeBYN } />
					</p>
					<p>
						USD: <input type="text" value={usd} onChange={ changeUSD } />
					</p>
				</div>
			</Main>
		</Layout>
	)
} 