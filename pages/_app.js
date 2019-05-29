import React from 'react'
import App, { Container } from 'next/app'
import { appWithTranslation } from '../i18n'
import { ApolloProvider } from 'react-apollo'
import withApollo from '../lib/withApollo'

class Bndby2 extends App {
	render() {
		const { Component, pageProps, graphql, apolloClient } = this.props
		return (
			<Container>
				<ApolloProvider client={apolloClient}>
					<Component {...pageProps} />
				</ApolloProvider>
			</Container>
		)
	}
}

// export default withApollo(appWithTranslation(Bndby2))
export default appWithTranslation(Bndby2)
//export default withApollo(Bndby2)
