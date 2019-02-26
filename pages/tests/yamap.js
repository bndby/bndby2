/**
 * 
 */
import React from 'react'
import { YMaps, Map, ZoomControl } from 'react-yandex-maps'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../../components/Layout'
import ASide from '../../components/Layout/ASide'
import Main from '../../components/Layout/Main'

/**
 * 
 */
import 'react-id-swiper/src/styles/css/swiper.css'

/**
 * 
 */
class YandexMapPage extends React.Component {

	render() {

		return (
			<Layout>
				<Head>
					<title>YaMap test page</title>
				</Head>
				<ASide>
					<Link href="/">
						<a>Назад</a>
					</Link>
					<h1>YaMap test page</h1>
				</ASide>

				<Main>
					<YMaps>
						<div className="yaMap">
							Яндекс карты:
							<br />
							<Map defaultState={{ center: [55.75, 37.57], zoom: 9 }} width="100%" height="400px">
								<ZoomControl />
							</Map>
						</div>
						<style jsx>{`
							.yaMap {
								margin: 40px 0;
							}
						`}</style>
					</YMaps>
				</Main>
			</Layout>
		)
	}
}

export default YandexMapPage