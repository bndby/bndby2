/**
 * 
 */
import React from 'react'
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
            href: "/tests/calc",
            ru: "Калькулятор",
            en: "Calc"
        },
        {
            href: "/tests/deploy",
            ru: "Deploy",
            en: "Deploy"
        }
        ,
        {
            href: "/tests/fancybox",
            ru: "fancybox",
            en: "fancybox"
        }
        ,
        {
            href: "/tests/md",
            ru: "Markdown",
            en: "Markdown"
        }
        ,
        {
            href: "/tests/swgoh",
            ru: "swgoh",
            en: "swgoh"
        }
        ,
        {
            href: "/tests/swiper",
            ru: "Swiper",
            en: "Swiper"
        }
        ,
        {
            href: "/tests/yamap",
            ru: "YaMap",
            en: "YaMap"
        }
    ]

	render() {
        const { t } = this.props

		return (
			<Layout>
				<Head>
					<title>{t( 'tests' )}</title>
				</Head>

					<h1>{t( 'tests' )}</h1>

					<ul>
                        {
                            this.pages.map( ( page ) => (
                                <li>
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


export default withNamespaces( 'common' )( Tests )