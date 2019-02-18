/**
 * 
 */
import React from 'react';
import Head from 'next/head'
import ReactFancyBox from 'react-fancybox'
import Layout from "../components/Layout";

/**
 * 
 */
import 'react-fancybox/lib/fancybox.css'

/**
 * 
 */
class FancyBox extends React.Component {

	render() {
		return (
			<Layout>
				<Head>
					<title>Fancybox test page</title>
				</Head>

				<h1>Fancybox test page</h1>

				<ReactFancyBox
					thumbnail="/static/1-thumb.jpg"
					image="/static/1.jpg" />
				<ReactFancyBox
					thumbnail="/static/2-thumb.jpg"
					image="/static/2.jpg" />
				<ReactFancyBox
					thumbnail="/static/3-thumb.jpg"
					image="/static/3.jpg" />
			</Layout>
		)
	}
}

export default SwiperPage