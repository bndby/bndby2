import React from 'react'
import fetch from 'isomorphic-unfetch'
import Layout from '../components/Layout'
import ReactMarkdown from 'react-markdown'
import { i18n, withNamespaces } from '../i18n'
import PropTypes from 'prop-types'

/**
 *
 * @param {*} props свойства
 */
const Book = props => (
	<div className="book">
		<h2>{props.title}</h2>
		{props.author && (
			<p>
				<i>{props.author}</i>
			</p>
		)}
		<ReactMarkdown source={props.desc} />
	</div>
)

/**
 *
 * @param {*} props свойства
 */
const Books2 = props => (
	<Layout>
		<h1>GraphQL</h1>

		{props.books.map((book, index) => (
			<div key={index}>
				<Book
					title={book.node.title}
					author={book.node.author}
					date={book.node.date}
					desc={book.node.desc}
				/>
			</div>
		))}
	</Layout>
)

Books2.getInitialProps = async function(context) {
	const locale = context.req ? context.req.locale : 'en'

	const query = `query {
		allBook (locale: "${locale}") {
		  edges {
			node {
				id,
				title,
				author,
				date,
				desc,
				cover
			}
		  }
		}
	  }`
	const res = await fetch('https://bndby-prime.herokuapp.com/graphql', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			query: query
		})
	})
	const data = await res.json()

	return {
		books: data.data.allBook.edges,
		namespacesRequired: ['common']
	}
}

/**
 *
 */
Books2.propTypes = {
	books: PropTypes.array
}

export default withNamespaces('common')(Books2)
