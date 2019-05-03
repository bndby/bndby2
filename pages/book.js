/**
 *
 */
import Layout from '../components/Layout.js'
import fetch from 'isomorphic-unfetch'
import ReactMarkdown from 'react-markdown'
import PropTypes from 'prop-types'
import Head from 'next/head'
import Link from 'next/link'

/**
 * 
 */
const Book = ( props ) => (
	<Layout nolang={ true }>
		<Head>
			<link rel="canonical" href={ `https://bnd.by/books/${props.slug}` } key="canonical" />
			<title>{ !!props.book && props.book.split( '\n', 1 )[0].split( '#', 2 )[1].trim() }</title>
		</Head>
		<p>
			<Link href="/books">
				<a>← Блог</a>
			</Link>
		</p>
		<ReactMarkdown source={ props.book } />

	</Layout>
)

/**
 * 
 */
Book.getInitialProps = async function (context) {
	const { slug } = context.query
	const res = await fetch(`https://raw.githubusercontent.com/bndby/bndby2/master/pages/books/${slug}.md`)
	const book = await res.text()

	return {
		book,
		slug
	}
}

/**
 * 
 */
Book.propTypes = {
	book: PropTypes.string,
	slug: PropTypes.string
}

/**
 * 
 */
export default Book