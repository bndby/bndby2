import React from 'react'
import App, { Container } from 'next/app'
import { appWithTranslation } from '../i18n'

class Bndby2 extends App {
	render() {
		const { Component, pageProps } = this.props
		return (
			<Container>
				<Component {...pageProps} />
			</Container>
		)
	}
}

export default appWithTranslation( Bndby2 )