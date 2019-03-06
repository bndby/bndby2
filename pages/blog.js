import Head from 'next/head'
import Layout from '../components/Layout'
import { i18n, Link, withNamespaces } from '../i18n'
import React from 'react'
import PropTypes from 'prop-types'

const PostLink = ( props ) => (
	<li>
		<Link as={`/post/${props.slug}`} href={`/post?slug=${props.slug}`}>
			<a>{props.title}</a>
		</Link>
	</li>
)

PostLink.propTypes = {
	slug: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired
}

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
				<ul>
					<PostLink slug="blog-slug" title="Blog post" />
				</ul>
			</Layout>
		)
	}
}

export default withNamespaces( 'common' )( Blog )