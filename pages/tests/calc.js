/**
 * 
 */
import Head from 'next/head'
import Layout from '../../components/Layout'
import { useState, useEffect } from 'react'

/**
 * 
 */
export default () => {

	const [byn, setBYN] = useState( 1 )
	const [usd, setUSD] = useState( 1 )
	const [eur, setEUR] = useState( 1 )
	const [exUSD, setExUSD] = useState( 1 )
	const [exEUR, setExEUR] = useState( 1 )

	useEffect( () => {
		fetch( 'https://www.nbrb.by/API/ExRates/Rates/145' )
			.then( ( data ) => data.json() )
			.then( ( data ) => {
				setExUSD( data.Cur_OfficialRate )
				setUSD( byn / exUSD )
			})
		fetch( 'https://www.nbrb.by/API/ExRates/Rates/292' )
			.then( ( data ) => data.json() )
			.then( ( data ) => {
				setExEUR( data.Cur_OfficialRate )
				setEUR( byn / exEUR )
			})
	}, [ byn, exUSD, exEUR ] )

	const changeBYN = ( event ) => {
		const input = parseFloat( event.target.value )
		setBYN( input )
		setUSD( input / exUSD )
		setEUR( input / exEUR )
	}

	const changeUSD = ( event ) => {
		const input = parseFloat( event.target.value )
		setUSD( input )
		setBYN( input * exUSD )
		setEUR( input * exUSD / exEUR )
	}

	const changeEUR = ( event ) => {
		const input = parseFloat( event.target.value )
		setEUR( input )
		setBYN( input * exEUR )
		setUSD( input * exEUR / exUSD )
	}

	return (
		<Layout>
			<Head>
				<title>Калькулятор</title>
			</Head>

			<div>
				<p>Курс: 1 USD = { exUSD } BYN<br />
					Курс: 1 EUR = { exEUR } BYN</p>
				<p>
						BYN: <input type="text" value={ Math.round( byn * 100 ) / 100 } onChange={ changeBYN } />
				</p>
				<p>
						USD: <input type="text" value={ Math.round( usd * 100 ) / 100 } onChange={ changeUSD } />
				</p>
				<p>
						EUR: <input type="text" value={ Math.round( eur * 100 ) / 100 } onChange={ changeEUR } />
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