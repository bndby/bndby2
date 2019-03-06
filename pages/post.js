import Layout from '../components/Layout.js'
import fetch from 'isomorphic-unfetch'
import ReactMarkdown from 'react-markdown'
import PropTypes from 'prop-types'

const Post = ( props ) => (
	<Layout>
		<ReactMarkdown source={ props.post } />
	</Layout>
)

Post.getInitialProps = async function (context) {
	const { slug } = context.query
	const res = await fetch(`https://raw.githubusercontent.com/bndby/bndby2/master/pages/blog/${slug}.md`)
	const post = await res.text()

	return {
		post,
		namespacesRequired: ['common']
	}
}

Post.propTypes = {
	post: PropTypes.string
}

export default Post