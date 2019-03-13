/**
 * 
 */
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../components/Layout'
import React from 'react'
import PropTypes from 'prop-types'

/**
 * 
 */
const PostLink = ( props ) => (
	<p>
		{ 
			props.date ?
				<><time>{ props.date }</time><br /></> :
				''
		}
		<Link as={`/post/${ props.slug }`} href={`/post?slug=${ props.slug }`}>
			<a>{ props.title }</a>
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
	date: PropTypes.string,
	children: PropTypes.node
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

		return (
			<Layout nolang={true}>
				<Head>
					<title>Блог</title>
				</Head>

				<h1>Блог</h1>


				<h2>Git</h2>

				<PostLink slug="2019-03-13-todo-list-markdown" title="Список задач в markdown на Github" date="13.03.2019">С 28 апреля 2014 года в любых markdown-документах на Github можно создавать списки задач</PostLink>

				<PostLink slug="2019-03-13-howto-date-jekyll" title="Как вывести дату поста в Jekyll шаблоне на Github Pages" date="13.03.2019">По умолчанию в Jekyll шаблонах на Github Pages можно форматировать только английские даты</PostLink>

				<PostLink slug="2019-03-13-howto-duplicate-git" title="Как сделать дубликат Git-репозитория" date="13.03.2019">Чтобы дублировать репозиторий без его «форка», вы можете запустить специальную команду clone, а затем запушиться в новый репозиторий</PostLink>

				<PostLink slug="2019-03-13-bitbucket-to-github" title="Как перейти с Bitbucket на GitHub" date="13.03.2019">С января 2019 года Гитхаб ввел бесплатные приватные репозитории.</PostLink>


				<h2>Cloudflare</h2>
				<PostLink slug="2019-03-12-cloudflare-datacenter" title="Датацентры Cloudflare" date="12.03.2019">Как узнать, какой датацентр Cloudflare меня обслуживает?</PostLink>

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
export default Blog