/**
 *
 */
const cacheableResponse = require('cacheable-response')
const express = require('express')
const next = require('next')
const nextI18NextMiddleware = require('next-i18next/middleware')

const nextI18next = require('./i18n')

/**
 *
 */
const dev = process.env.NODE_ENV !== 'production'
const port = process.env.PORT || 9000
const app = next({ dev })
const handle = app.getRequestHandler()

/**
 *
 */
const ssrCache = cacheableResponse({
	ttl: 1000 * 60 * 60, // 1hour
	get: async ({ req, res, pagePath, queryParams }) => ({
		data: await app.renderToHTML(req, res, pagePath, queryParams)
	}),
	send: ({ data, res }) => res.send(data)
})

/**
 *
 */
app.prepare()
	.then(() => {
		const server = express()

		server.use(nextI18NextMiddleware(nextI18next))

		/* Homepage */
		server.get('/', (req, res) => ssrCache({ req, res, pagePath: '/' }))

		server.get('/notes/:slug', (req, res) => {
			const actualPage = '/note'
			const queryParams = { slug: req.params.slug }
			// app.render(req, res, actualPage, queryParams)
			return ssrCache({ req, res, actualPage, queryParams })
		})

		server.get('*', (req, res) => {
			return handle(req, res)
		})

		server.listen(port, err => {
			if (err) throw err
			console.log(`> Ready on http://localhost:${port}`) // eslint-disable-line no-console
		})
	})
	.catch(ex => {
		console.error(ex.stack) // eslint-disable-line no-console
		process.exit(1)
	})
