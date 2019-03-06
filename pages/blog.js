import Layout from '../components/Layout.js'
import Link from 'next/link'

const PostLink = (props) => (
	<li>
		<Link as={`/post/${props.slug}`} href={`/post?slug=${props.slug}`}>
			<a>{props.title}</a>
		</Link>
	</li>
)

const Blog = () => (
	<Layout>
		<h1>My Blog</h1>
		<ul>
			<PostLink slug="blog-slug" title="Blog post" />
		</ul>
	</Layout>
)

export default Blog