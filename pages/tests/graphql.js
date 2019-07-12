import React from 'react'
import fetch from 'isomorphic-unfetch'
import Layout from '../../components/Layout'
import ReactMarkdown from 'react-markdown'
import { i18n, withNamespaces } from '../../i18n'
import PropTypes from 'prop-types'

/**
 * 
 * @param {*} props 
 */
const GraphQL = (props) => (
	<Layout>

		<h1>GraphQL</h1>

		<ReactMarkdown source={props.pages[0].node.content} />
		
	</Layout>
)
  
GraphQL.getInitialProps = async function( context ) {

	const locale = context.req ? context.req.locale : 'en'

	const query = `query cvPage ($slug: String) {
		allPage (locale: "${locale}", where:{
		  slug: {
			eq: $slug
		  }
		}) {
		  edges {
			node {
			  title,
			  content
			}
		  }
		}
	  }`
	const res = await fetch('https://bndby-prime.herokuapp.com/graphql', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			query: query,
			'slug': 'cv'
		}),
	})
	const data = await res.json()
  
	return {
		pages: data.data.allPage.edges,
		namespacesRequired: ['common']
	}
}

/**
 * 
 */
GraphQL.propTypes = {
	pages: PropTypes.array
}

export default withNamespaces( 'common' )( GraphQL )