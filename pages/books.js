/**
 * 
 */
import Head from 'next/head'
import fetch from 'isomorphic-unfetch'
import Layout from '../components/Layout'
import React from 'react'
import PropTypes from 'prop-types'
import * as Convert from 'xml-js'

const Book = ( props ) => (
	<>
		<h2>{props.title}</h2>
		<p className="book" key={props.index}>
			<img src={props.img} align="left" width="80" />
			<i>{props.author}</i>
			<br />
			<small dangerouslySetInnerHTML={{
				__html: props.desc
			}} />
			<br clear="all" />
		</p>
	</>
)

Book.propTypes = {
	title: PropTypes.string,
	index: PropTypes.number,
	img: PropTypes.string,
	author: PropTypes.string,
	desc: PropTypes.string
}

/**
 * 
 */
class Books extends React.Component {

	

	static async getInitialProps() {

		const apiKey = 'EAPtbpgXDcJuonruUqHe1A'
		const userId = '96877882'
		const shelf = 'read'
		const sort = 'date_read'

		const apiPoint = `https://cors-anywhere.herokuapp.com/https://www.goodreads.com/review/list?v=2&id=${userId}&shelf=${shelf}&sort=${sort}&order=d&page=1&per_page=200&key=${apiKey}`


		const res = await fetch( apiPoint, {
			method: 'GET',
			headers: {
				'content-type': 'application/xml',
				'access-control-allow-origin': '*'
			},
			credentials: 'omit'
		})

		const data = await res.text()

		const json = Convert.xml2js(data, {
			ignoreComment: true,
			alwaysChildren: true
		})

		return {
			namespacesRequired: ['common'],
			data: json
		}
	}

	render(){
		const books = this.props.data.elements[0].elements[2].elements
		
		let renderBooks = []
		books.map( function( book, index ){
			// console.log( book )
			renderBooks.push(
				<Book
					key={index}
					title={book.elements[1].elements[5].elements[0].text}
					img={book.elements[1].elements[7].elements[0].text}
					desc={book.elements[1].elements[20].elements[0].text}
					author={book.elements[1].elements[21].elements[0].elements[1].elements[0].text}
				/> )
		})

		return (
			<Layout nolang={true}>
				<Head>
					<title>Книги</title>
				</Head>

				<h1>Книги</h1>
				{renderBooks}

			</Layout>
		)
	}
}

Books.propTypes = {
	data: PropTypes.object
}

/**
 * 
 */
export default Books