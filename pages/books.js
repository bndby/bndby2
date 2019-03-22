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
const BookLink = ( props ) => (
	<p>
		{ props.date ? <><time>{ props.date }</time><br /></> : '' }
		<Link as={`/books/${ props.slug }`} href={`/book?slug=${ props.slug }`}>
			<a>{ props.title }</a>
		</Link>
		{ props.children ? <><br />{ props.children }</> : '' }
	</p>
)

/**
 * 
 */
BookLink.propTypes = {
	slug: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	date: PropTypes.string,
	children: PropTypes.node
}

/**
 * 
 */
class Books extends React.Component {

	static async getInitialProps() {
		return {
			namespacesRequired: ['common']
		}
	}

	render(){

		return (
			<Layout nolang={true}>
				<Head>
					<title>Книги</title>
				</Head>

				<h1>Книги</h1>

				<BookLink slug="2019-03-19-volny-gasyat-veter" title="Волны гасят ветер" date="19.03.2019">О проблемах добра и зла, насильственного внедрения добра, «вертикальных прогрессов» и целях, которые ставит перед собой человечество и разум вообще, в конечном счете, о проблемах гуманизма и человечности.</BookLink>

				<BookLink slug="2019-03-16-stepfordskie-zheny" title="Степфордские жены, Айра Левин" date="16.03.2019">Для Джоанны, ее мужа Уолтера и их детей переезд в живописный Степфорд — событие слишком чудесное, чтобы быть правдой. Но за идиллическим фасадом города скрывается страшная тайна, тайна настолько ужасная, что для каждого вновь прибывшего она открывается со своей стороны</BookLink>

				<BookLink slug="2019-03-15-rasskaz-sluzhanki" title="Рассказ Служанки, Маргарет Этвуд" date="15.03.2019">В дивном новом мире женщины не имеют права владеть собственностью, работать, любить, читать и писать. Они не могут бегать по утрам, устраивать пикники и вечеринки, им запрещено вторично выходить замуж. Им оставлена лишь одна функция</BookLink>

			</Layout>
		)
	}
}

/**
 * 
 */
export default Books