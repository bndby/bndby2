import Layout from '../components/Layout.js'
import fetch from 'isomorphic-unfetch'
import ReactMarkdown from 'react-markdown'
import PropTypes from 'prop-types'
import Head from 'next/head'
import Link from 'next/link'

const Post = ( props ) => (
	<Layout nolang={ true }>
		<Head>
			<link rel="canonical" href={ `https://bnd.by/post/${props.slug}` } key="canonical" />
			<title>{ !!props.post && props.post.split( '\n', 1 )[0].split( '#', 2 )[1].trim() }</title>
		</Head>
		<p>
			<Link href="/blog">
				<a>← Блог</a>
			</Link>
		</p>
		<ReactMarkdown source={ props.post } />

	</Layout>
)

Post.getInitialProps = async function (context) {
	const { slug } = context.query
	const res = await fetch(`https://raw.githubusercontent.com/bndby/bndby2/master/pages/blog/${slug}.md`)
	const post = await res.text()

	return {
		post,
		slug
	}
}

Post.propTypes = {
	post: PropTypes.string
}

export default Post