/**
 * 
 */
import React from 'react'
import Swiper from 'react-id-swiper'
import Head from 'next/head'
import Layout from '../../components/Layout'

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
			spaceBetween: 30,
			slidesPerView: 1
		}

		return (
			<Layout>
				<Head>
					<title>Swiper test page</title>
					<link rel="canonical" href="https://bnd.by/tests/swiper" />
				</Head>

				<Swiper {...params}>
					<div style={{background: 'tomato'}}>Slide 1</div>
					<div style={{background: 'green'}}>Slide 2</div>
					<div style={{background: 'silver'}}>Slide 3</div>
					<div style={{background: 'gold'}}>Slide 4</div>
					<div style={{background: 'skyblue'}}>Slide 5</div>
					<style jsx>{`
						div {
							min-height: 200px;
							display: flex;
							align-items: center;
							justify-content: center;
						}
					`}</style>
				</Swiper>

			</Layout>
		)
	}
}

export default SwiperPage