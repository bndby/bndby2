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
const NoteLink = ( props ) => (
	<p>
		{ 
			props.date ?
				<><time>{ props.date }</time><br /></> :
				''
		}
		<Link as={`/notes/${ props.slug }`} href={`/note?slug=${ props.slug }`}>
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
NoteLink.propTypes = {
	slug: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	date: PropTypes.string,
	children: PropTypes.node
}

/**
 * 
 */
class Notes extends React.Component {

	static async getInitialProps() {
		return {
			namespacesRequired: ['common']
		}
	}

	render(){

		return (
			<Layout nolang={true}>
				<Head>
					<title>Заметки</title>
				</Head>

				<h1>Заметки</h1>

				{/* ========================= */}

				<h2>Javascript</h2>

				<NoteLink slug="2019-03-15-js-mediaquery" title="Медиа запросы в Javascript" />

				<NoteLink slug="2019-03-26-swiper-es6" title="Подключаем swiper как es6 модуль"></NoteLink>

				{/* ========================= */}

				<h2>Git</h2>

				<NoteLink slug="2019-03-13-todo-list-markdown" title="Список задач в markdown на Github">С 28 апреля 2014 года в любых markdown-документах на Github можно создавать списки задач</NoteLink>

				<NoteLink slug="2019-03-13-howto-date-jekyll" title="Как вывести дату поста в Jekyll шаблоне на Github Pages">По умолчанию в Jekyll шаблонах на Github Pages можно форматировать только английские даты</NoteLink>

				<NoteLink slug="2019-03-13-howto-duplicate-git" title="Как сделать дубликат Git-репозитория">Чтобы дублировать репозиторий без его «форка», вы можете запустить специальную команду clone, а затем запушиться в новый репозиторий</NoteLink>

				<NoteLink slug="2019-03-13-bitbucket-to-github" title="Как перейти с Bitbucket на GitHub">С января 2019 года Гитхаб ввел бесплатные приватные репозитории.</NoteLink>

				{/* ========================= */}

				<h2>Cloudflare</h2>

				<NoteLink slug="2019-03-12-cloudflare-datacenter" title="Датацентры Cloudflare">Как узнать, какой датацентр Cloudflare меня обслуживает?</NoteLink>

			</Layout>
		)
	}
}

Notes.propTypes = {
	t: PropTypes.func
}

/**
 * 
 */
export default Notes