/**
 * 
 */
import React from 'react'
import PropTypes from 'prop-types'
import Head from 'next/head'
import Layout from '../components/Layout'
import { i18n, Link, withNamespaces } from '../i18n'

/**
 * 
 */
class Tests extends React.Component {

	static async getInitialProps() {
		return {
			namespacesRequired: ['common']
		}
	}
	
	pages = [
		{
			href: '/tests/hex-rgb',
			ru: 'HEX to RGB, RGB to HEX',
			en: 'HEX to RGB, RGB to HEX'
		},
		{
			href: '/tests/calc',
			ru: 'Калькулятор валют',
			en: 'Exchange Calc'
		},
		{
			href: '/tests/deploy',
			ru: 'Deploy',
			en: 'Deploy'
		},
		{
			href: '/tests/fancybox',
			ru: 'fancybox',
			en: 'fancybox'
		},
		{
			href: '/tests/md',
			ru: 'Markdown',
			en: 'Markdown'
		},
		{
			href: '/tests/swgoh',
			ru: 'swgoh',
			en: 'swgoh'
		},
		{
			href: '/tests/swiper',
			ru: 'Swiper',
			en: 'Swiper'
		},
		{
			href: '/tests/yamap',
			ru: 'YaMap',
			en: 'YaMap'
		},
		{
			href: '/tests/wp-api',
			ru: 'WP API',
			en: 'WP API'
		}
	]

	render() {
		const { t } = this.props

		return (
			<Layout>
				<Head>
					<title>{ t( 'tests' ) }</title>
				</Head>

				<h1>{ t( 'tests' ) }</h1>

				<ul>
					{
						this.pages.map( ( page, index ) => (
							<li key={ index }>
								<Link href={ page.href }>
									<a>
										{ i18n.language === 'ru' && page.ru }
										{ i18n.language === 'en' && page.en }
									</a>
								</Link>
							</li>
						))
					}
				</ul>

			</Layout>
		)
	}
}

/**
 * 
 */
Tests.propTypes = {
	children: PropTypes.node,
	t: PropTypes.func
}

export default withNamespaces( 'common' )( Tests )