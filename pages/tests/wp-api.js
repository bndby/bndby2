import React from 'react'
import fetch from 'isomorphic-unfetch'
import Head from 'next/head'
import Layout from '../../components/Layout'
import Link from 'next/link'

const WpAPI = (props) => (
	<Layout>
		<h1>Ahec-tax posts</h1>

		{/*console.log( props.shows )*/}

		{props.shows.map(({id, date, title, content}) => (
			<div key={id}>
				<h2>
					{title.rendered}
				</h2>
				<p><i>{date}</i></p>
				<div dangerouslySetInnerHTML={{ __html: content.rendered }}></div>
				<hr />
			</div>
		))}

	</Layout>
)
  
WpAPI.getInitialProps = async function() {
	const res = await fetch('https://ahec-tax.co.il/wp-json/wp/v2/posts')
	const data = await res.json()
  
	//console.log(`Show data fetched. Count: ${data.length}`)
  
	return {
		shows: data
	}
}

export default WpAPI