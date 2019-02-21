/**
 * 
 */
import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Gallery from 'react-photo-gallery'
import Lightbox from 'react-images'
import Layout from '../components/Layout'
import ASide from '../components/Layout/ASide'
import Main from '../components/Layout/Main'

/**
 * 
 */
const photos = [
	{ src: '/static/images/1.jpg', width: 3, height: 2 },
	{ src: '/static/images/2.jpg', width: 3, height: 2 },
	{ src: '/static/images/3.jpg', width: 3, height: 2 },
	{ src: '/static/images/2.jpg', width: 3, height: 2 },
	{ src: '/static/images/3.jpg', width: 3, height: 2 },
	{ src: '/static/images/1.jpg', width: 3, height: 2 },
	{ src: '/static/images/3.jpg', width: 3, height: 2 },
	{ src: '/static/images/1.jpg', width: 3, height: 2 },
	{ src: '/static/images/2.jpg', width: 3, height: 2 },
	{ src: '/static/images/2.jpg', width: 3, height: 2 }
]

/**
 * 
 */
class LightboxPage extends React.Component {
	constructor() {
		super()
		this.state = { currentImage: 0 }
		this.closeLightbox = this.closeLightbox.bind(this)
		this.openLightbox = this.openLightbox.bind(this)
		this.gotoNext = this.gotoNext.bind(this)
		this.gotoPrevious = this.gotoPrevious.bind(this)
	}

	openLightbox(event, obj) {
		this.setState({
			currentImage: obj.index,
			lightboxIsOpen: true,
		})
	}

	closeLightbox() {
		this.setState({
			currentImage: 0,
			lightboxIsOpen: false,
		})
	}

	gotoPrevious() {
		this.setState({
			currentImage: this.state.currentImage - 1,
		})
	}

	gotoNext() {
		this.setState({
			currentImage: this.state.currentImage + 1,
		})
	}

	render() {
		return (
			<Layout>
				<Head>
					<title>Fancybox test page</title>
				</Head>
				<ASide>
					<Link href="/">
						<a>Назад</a>
					</Link>
					<h1>Fancybox test page</h1>
				</ASide>
				<Main>
					<Gallery photos={photos} onClick={this.openLightbox} columns="5" />
					<Lightbox images={photos}
						onClose={this.closeLightbox}
						onClickPrev={this.gotoPrevious}
						onClickNext={this.gotoNext}
						currentImage={this.state.currentImage}
						isOpen={this.state.lightboxIsOpen} />
				</Main>
			</Layout>
		)
	}
}

export default LightboxPage