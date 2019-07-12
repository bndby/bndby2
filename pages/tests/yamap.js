/**
 *
 */
import React from 'react'
import { YMaps, Map, ZoomControl } from 'react-yandex-maps'
import Head from 'next/head'
import Layout from '../../components/Layout'

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

				<YMaps>
					<div className="yaMap">
						Яндекс карты:
						<br />
						<Map
							defaultState={{ center: [55.75, 37.57], zoom: 9 }}
							width="100%"
							height="400px"
						>
							<ZoomControl />
						</Map>
					</div>
					<style jsx>{`
						.yaMap {
							margin: 40px 0;
						}
					`}</style>
				</YMaps>
			</Layout>
		)
	}
}

export default YandexMapPage
