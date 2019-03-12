/**
 * 
 */
import Head from 'next/head'
import Layout from '../components/Layout'
import { i18n, Link, withNamespaces } from '../i18n'
import React from 'react'
import PropTypes from 'prop-types'

/**
 * 
 */
const PostLink = ( props ) => (
	<p>
		{ 
			props.date ?
				<><time>{props.date}</time><br /></> :
				''
		}
		<Link as={`/post/${props.slug}`} href={`/post?slug=${props.slug}`}>
			<a>{props.title}</a>
		</Link>
		{
			props.children ?
				<><br />{ props.children }</> :
				''
		}
	</p>
)

/**
 * 
 */
PostLink.propTypes = {
	slug: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	date: PropTypes.string
}

/**
 * 
 */
class Blog extends React.Component {

	static async getInitialProps() {
		return {
			namespacesRequired: ['common']
		}
	}

	render(){

		const { t } = this.props

		return (
			<Layout>
				<Head>
					<title>{ t( 'blog' ) }</title>
				</Head>

				<h1>{ t( 'blog' ) }</h1>

				<PostLink slug="2019-03-12-cloudflare-datacenter" title="Датацентры Cloudflare" date="12.03.2019">
					Как узнать, какой датацентр Cloudflare меня обслуживает?
				</PostLink>

			</Layout>
		)
	}
}

Blog.propTypes = {
	t: PropTypes.func
}

/**
 * 
 */
export default withNamespaces( 'common' )( Blog )