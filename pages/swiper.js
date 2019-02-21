/**
 * 
 */
import React from 'react'
import Swiper from 'react-id-swiper'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../components/Layout'
import ASide from '../components/Layout/ASide'
import Main from '../components/Layout/Main'

/**
 * 
 */
import 'react-id-swiper/src/styles/css/swiper.css'

/**
 * 
 */
class SwiperPage extends React.Component {

	render() {
		const params = {
			spaceBetween: 30
		}

		return (
			<Layout>
				<Head>
					<title>Swiper test page</title>
				</Head>
				<ASide>
					<Link href="/">
						<a>Назад</a>
					</Link>
					<h1>Swiper test page</h1>
				</ASide>
				<Main>
					<div style={{width: '100%'}}>
						<Swiper {...params}>
							<div style={{background: 'red'}}>Slide 1</div>
							<div style={{background: 'green'}}>Slide 2</div>
							<div>Slide 3</div>
							<div>Slide 4</div>
							<div>Slide 5</div>
							<style jsx>{`
								div {
									min-height: 200px;
									display: flex;
									align-items: center;
									justify-content: center;
								}
							`}</style>
						</Swiper>
					</div>
				</Main>
			</Layout>
		)
	}
}

export default SwiperPage