import React from 'react'
import fetch from 'isomorphic-unfetch'
import Layout from '../../components/Layout'
import ReactMarkdown from 'react-markdown'

/**
 * 
 * @param {*} props 
 */
const WpAPI = (props) => (
	<Layout>
		<h1>GraphQL</h1>

		<ReactMarkdown source={props.pages[0].node.content} />
		

	</Layout>
)
  
WpAPI.getInitialProps = async function() {
	const query = `{
		allPage (locale: "ru") {
			edges {
				node {
					title,
					slug,
					content,
					_meta {
						id
					}
				}
			}
		}
	}`
	const res = await fetch('https://bndby-prime.herokuapp.com/graphql', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			query: query
		}),
	})
	const data = await res.json()
  
	console.log(`Show data fetched. Count: ${data.length}`)
  
	return {
		pages: data.data.allPage.edges
	}
}

export default WpAPI