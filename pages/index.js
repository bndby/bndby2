/**
 *
 */
import React from 'react'
import gql from 'graphql-tag'
import Head from 'next/head'
import Layout from '../components/Layout'
import { i18n, withNamespaces } from '../i18n'
import PropTypes from 'prop-types'

export const query = gql`
	query {
		allBook {
			edges {
				node {
					_meta {
						updatedAt
					}
					id
					title
					author
					date
					desc
				}
			}
		}
	}
`

/**
 *
 */
class Index extends React.Component {
	static async getInitialProps() {
		return {
			namespacesRequired: ['common']
		}
	}

	render() {
		const { t } = this.props

		return (
			<Layout>
				<Head>
					<title>{t('name')}</title>
				</Head>

				<h1>{t('cv')}</h1>

				<section id="skills">
					<h2>{t('skills')}</h2>
					<ol>
						<li>
							HTML, <small>Markdown</small>;
						</li>
						<li>
							CSS, <small>LESS, SCSS, Stylus, PostCSS</small>;
						</li>
						<li>
							JavaScript, <small>ES6+, Node.js</small>;
						</li>
						<li>JQuery, React, Next.js, Angular 2+;</li>
						<li>XML, XSLT, XPath, SVG;</li>
						<li>PHP, Parser;</li>
						<li>MySQL;</li>
						<li>WAI-ARIA;</li>
						<li>
							<small>
								Wordpress, Symphony CMS, Mediawiki, Tilda,
								Github Pages, Cloudflare
							</small>
							;
						</li>
						<li>Gulp, Webpack, Git;</li>
						<li>Linux, Windows.</li>
					</ol>
				</section>

				<section id="experience">
					<h2>{t('experience')}</h2>

					<h3>
						<img src="/static/images/bnweb.svg" alt="BN Studio" />
						<br />
						BN Studio
					</h3>
					<h4>
						{t('April')} 2017 — {t('Now')}
					</h4>

					<dl>
						{/* PRODALIM */}
						<dt>
							<a href="https://prodalim.com/">Prodalim Group</a>
						</dt>
						<dd>
							<time>{t('June')} 2019</time>
							<br />
							{t('development')}: PostCSS, ES6, Webpack, Gulp
						</dd>

						{/* BOGORAD */}
						<dt>
							<a href="https://nbogorad.com/">
								Natali Bogorad&#8217;s Design cafe
							</a>
						</dt>
						<dd>
							<time>{t('March')} 2019</time>
							<br />
							{t('development')}: XSLT, PostCSS, ES6, Webpack,
							Gulp
						</dd>

						{/* MOSCOW SEASONS */}
						<dt>
							<a href="https://moscowseasons.com/">
								Moscow Seasons
							</a>
						</dt>
						<dd>
							<time>{t('Febrary')} 2019</time>
							<br />
							{t('support')}: React, Stylus
						</dd>

						<dt>
							<a href="https://www.nadlan.gov.il/">
								{' '}
								אתר הנדל״ן הממשלתי{' '}
							</a>
						</dt>
						<dd>
							<time>{t('December')} 2018</time>
							<br />
							{t('support')}: HTML, CSS, AngularJS, Grunt
						</dd>

						<dt>
							<a href="https://bnweb.studio">BN Studio</a>
						</dt>
						<dd>
							<time>{t('August')} 2018</time>
							<br />
							{t('development')}: HTML, LESS, JS, Gulp, Cloudflare
						</dd>
						<dt>
							<a href="https://skirollers.ru/">Ski Rollers</a>
						</dt>
						<dd>
							<time>{t('June')} 2018</time>
							<br />
							{t('development')}: Wordpress, HTML, LESS, JS
						</dd>
						<dt>
							<a
								href="https://ahec-tax.co.il/"
								dir="rtl"
								lang="he"
							>
								ארצי, חיבה, אלמקייס, כהן — פתרונות מיסוי
							</a>
						</dt>
						<dd>
							<time>{t('October')} 2017</time>
							<br />
							{t('support')}: Wordpress, HTML, LESS, JS, PHP
						</dd>
					</dl>

					<h3>
						<img src="/static/images/klen.png" alt="Klen" />
						<br />
						{t('Klen')}
					</h3>
					<h4>{t('November')} 2009 — 2016</h4>

					<p>{t('Klen-desc')}</p>

					<dl>
						<dt>
							<a href="http://klen.by/">{t('Klen')}</a>
						</dt>
						<dd>
							<time>{t('Jule')} 2015</time>
							<br />
							{t('development')}: Symphony CMS, XSLT
						</dd>
						<dt>
							<a href="http://skinali.by/">
								{t('Skinali-catalog')}
							</a>
						</dt>
						<dd>
							<time>{t('September')} 2015</time>
							<br />
							{t('development')}: Symphony CMS, XSLT
						</dd>
					</dl>

					<p>
						{i18n.language === 'ru' && 'Фриланс-работы:'}
						{i18n.language === 'en' && 'Fleelance works:'}
					</p>
					<dl>
						<dt>
							<a href="https://fitness.edu.au/">
								Australian Institute of Fitness
							</a>
						</dt>
						<dd>
							{t('support')}: Symphony CMS, XSLT, HTML, CSS, JS,
							UIKit
						</dd>

						<dt>
							<a href="http://ratur.by/">
								{i18n.language === 'ru' && 'Буровая компания'}
								{i18n.language === 'en' && 'Drilling company'}
							</a>
						</dt>
						<dd>{t('development')}: Wordpress</dd>

						<dt>
							<a href="http://teplo-vitebsk.by/">
								{i18n.language === 'ru' &&
									'Магазин отопительного оборудования'}
								{i18n.language === 'en' &&
									'Heating Equipment Store'}
							</a>
						</dt>
						<dd>{t('development')}: Wordpress, WooCommerce</dd>
					</dl>

					<h3>
						<img
							src="/static/images/cpeople.svg"
							alt="Creative People"
						/>
						<br />
						Creative People
					</h3>
					<h4>
						{t('November')} 2015 — {t('May')} 2017,
						<br />
						{t('September')} 2011 — {t('November')} 2012,
					</h4>

					<p>
						{i18n.language === 'ru' &&
							'Работал удаленно технологом в отделе поддержки. Занимался сопровождением сайтов клиентов:'}
						{i18n.language === 'en' &&
							'Worked remotely as a technologist in the support department. Engaged in the maintenance of customer sites:'}
					</p>

					<ul>
						<li>
							<a href="http://polyusgold.com/ru/">
								{i18n.language === 'ru' && 'Полюс'}
								{i18n.language === 'en' && 'Polyus'}
							</a>
						</li>
						<li>
							<a href="http://stada.ru/">
								{i18n.language === 'ru' && 'Штада'}
								{i18n.language === 'en' && 'Stada'}
							</a>
						</li>
						<li>
							{i18n.language === 'ru' && 'Природа Amway'}
							{i18n.language === 'en' && 'Amway'}
						</li>
						<li>
							{i18n.language === 'ru' && 'Фитнес клубы «Физика»'}
							{i18n.language === 'en' && 'Fitness club "Fizika"'}
						</li>
						<li>Merz</li>
						<li>
							<a href="http://carpethouse.ru/">Carpet House</a>
						</li>
						<li>Saimaa</li>
						<li>Braer</li>
					</ul>

					<p>
						{i18n.language === 'ru' && 'Версткой шаблонов:'}
						{i18n.language === 'en' && 'Frontend:'}
					</p>

					<ul>
						<li>
							<a href="http://www.at-consulting.ru/">
								AT Consulting
							</a>
						</li>
						<li>DSMU</li>
					</ul>

					<p>
						{i18n.language === 'ru' &&
							'Кроме этого собрал два сайта на Symphony CMS:'}
						{i18n.language === 'en' && 'Backend on Symphony CMS:'}
					</p>

					<ul>
						<li>
							<a href="http://jenialubich.com/">
								{i18n.language === 'ru' &&
									'Сайт певицы Жени Любич'}
								{i18n.language === 'en' && 'Jenia Lubich'}
							</a>
						</li>
						<li>
							{i18n.language === 'ru' && 'Ингруп СтС'}
							{i18n.language === 'en' && 'Ingroup STS'}
						</li>
					</ul>

					<h3>
						<img src="/static/images/als.svg" alt="ALS" />
						<br />
						{i18n.language === 'ru' && 'Студия Артемия Лебедева'}
						{i18n.language === 'en' && 'Art Lebedev Studio'}
					</h3>
					<h4>
						{t('November')} 2006 — {t('November')} 2009
					</h4>

					<p>
						{i18n.language === 'ru' &&
							'Работал кодером в отделе поддержки. Занимался сопровождением сайтов клиентов на системах '}
						{i18n.language === 'en' &&
							'I worked as a coder in the support department. Engaged in the maintenance of client sites on systems '}
						<a href="https://imprimatur.artlebedev.ru/">
							Imprimatur и Imprimatur II
						</a>
						:
					</p>

					<ul>
						<li>
							<a href="https://www.artlebedev.ru/everything/vbank/site2/">
								{i18n.language === 'ru' && 'Банк Возрождение'}
								{i18n.language === 'en' && 'Vozrozhdenie'}
							</a>
							;
						</li>
						<li>
							<a href="https://www.artlebedev.ru/everything/gazprom/gazfond-site2/">
								{i18n.language === 'ru' && 'НПФ «Газфонд»'}
								{i18n.language === 'en' && 'Gazfond'}
							</a>
							;
						</li>
						<li>
							<a href="https://www.artlebedev.ru/everything/caravan/">
								{i18n.language === 'ru' && 'Караван'}
								{i18n.language === 'en' && 'Caravan'}
							</a>
							;
						</li>
						<li>
							<a href="https://www.artlebedev.ru/everything/medicina/site2/">
								{i18n.language === 'ru' && 'Медицина'}
								{i18n.language === 'en' && 'Medicina'}
							</a>
							;
						</li>
						<li>
							<a href="https://www.artlebedev.ru/everything/imb/site2/">
								{i18n.language === 'ru' &&
									'Международный московский банк'}
								{i18n.language === 'en' && 'IMB'}
							</a>
							;
						</li>
						<li>
							<a href="https://www.artlebedev.ru/everything/nomos/site/">
								{i18n.language === 'ru' && 'Номос-банк'}
								{i18n.language === 'en' && 'Nomos'}
							</a>
							;
						</li>
						<li>
							<a href="https://www.artlebedev.ru/everything/spb/site2/">
								{i18n.language === 'ru' &&
									'Сайт города Санкт-Петербурга'}
								{i18n.language === 'en' && 'St. Petersburg'}
							</a>
							;
						</li>
						<li>
							<a href="https://www.artlebedev.ru/everything/hp/site4/">
								Hewlett-Packard
							</a>
							.
						</li>
					</ul>
				</section>

				<section id="speaker">
					<h2>{t('Speaker')}</h2>
					<ul>
						<li>
							<a href="https://communities.by/events/miniq-vitebsk-14/talks/684">
								{t('CSS-Practice')}
							</a>
						</li>
					</ul>
				</section>

				<section id="education">
					<h2>{t('education')}</h2>
					<dl>
						<dt>
							<b>
								{i18n.language === 'ru' &&
									'ВГУ им. П. М. Машерова'}
								{i18n.language === 'en' && 'VSU Masherova'}
							</b>
							, 1999 — 2004
						</dt>
						<dd>
							{i18n.language === 'ru' && 'Высшее, техническое'}
							{i18n.language === 'en' && 'Higher technical'}
							<br />
							{i18n.language === 'ru' &&
								'Специальности: математик-программист, преподаватель математики и информатики'}
							{i18n.language === 'en' &&
								'Specialties: software mathematician, teacher of mathematics and computer science'}
						</dd>
					</dl>
				</section>
			</Layout>
		)
	}
}

/**
 *
 */
Index.propTypes = {
	children: PropTypes.node,
	t: PropTypes.func
}

export default withNamespaces('common')(Index)
