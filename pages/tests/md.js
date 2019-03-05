/**
 * 
 */
import React from 'react'
import ReactMarkdown from 'react-markdown'
import 'isomorphic-unfetch'
import Head from 'next/head'
import Layout from '../../components/Layout'

/**
 * 
 */
export default class Preact extends React.Component {
    static async getInitialProps () {
        // eslint-disable-next-line no-undef
        const res = await fetch('https://raw.githubusercontent.com/bndby/bndby2/master/README.md')
        const text = await res.text()
        return { 
            namespacesRequired: ['common'],
            md: text
        }
    }
  
    render () {
        return (
            <Layout>
                <Head>
                    <title>Markdown</title>
                </Head>

                <ReactMarkdown source={ this.props.md } />

            </Layout>
        )
    }
}