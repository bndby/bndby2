const express = require('express')
const next = require('next')
const nextI18NextMiddleware = require('next-i18next/middleware')

const nextI18next = require('./i18n')

const dev = process.env.NODE_ENV !== 'production'
const port = process.env.PORT || 9000
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare()
	.then( () => {
		const server = express()

		server.use( nextI18NextMiddleware( nextI18next ) )

		server.get('/post/:slug', (req, res) => {
			const actualPage = '/post'
			const queryParams = { slug: req.params.slug } 
			app.render(req, res, actualPage, queryParams)
		})

		server.get( '*', ( req, res ) => {
			return handle(req, res)
		})

		server.listen( port, ( err ) => {
			if( err ) throw err
			console.log( `> Ready on http://localhost:${port}` ) // eslint-disable-line no-console
		})
	})
	.catch((ex) => {
		console.error( ex.stack ) // eslint-disable-line no-console
		process.exit( 1 )
	})