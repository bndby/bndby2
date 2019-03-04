/**
 * 
 */
import React from 'react'
import Head from 'next/head'
import Layout from '../components/Layout'
import { i18n, Link, withNamespaces } from '../i18n'
import LanguageSelector from '../components/LanguageSelector'

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
					<title>{t( 'name' )} ({i18n.language})</title>
					<link rel="canonical" href="https://bnd.by/" />
				</Head>

					<h1>{t( 'cv' )}</h1>

					<section id="skills">
						<h2>{t( 'skills' )}</h2>
						<ol>
							<li>HTML, Markdown;</li>
							<li>CSS, LESS, SCSS, Stylus, PostCSS;</li>
							<li>JavaScript, JQuery;</li>
							<li>ES6, Node.js, React, Next.js;</li>
							<li>XML, XSLT, XPath, SVG;</li>
							<li>PHP, Parser;</li>
							<li>MySQL;</li>
							<li>WAI-ARIA;</li>
							<li>Wordpress, Symphony CMS, Mediawiki, Tilda, Github Pages, Cloudflare.</li>
							<li>Gulp, Webpack, Git</li>
							<li>Linux, Windows</li>
						</ol>
					</section>

					<section id="experience">

						<h2>{t( 'experience' )}</h2>

						<h3>BN Studio</h3>

						{ i18n.language === 'ru' && <h4>апрель 2017 — настоящее время</h4> }
						{ i18n.language === 'en' && <h4>april 2017 — now</h4> }

						<dl>
							<dt>
								<a href="https://bnweb.studio">BN Studio</a>
							</dt>
							<dd>
								{ i18n.language === 'ru' && <time> август 2018 года</time> }
								{ i18n.language === 'en' && <time> august 2018</time> }
								<br />
								HTML, LESS, JS, Gulp, Cloudflare
							</dd>
							<dt>
								<a href="https://skirollers.ru/">Ski Rollers</a>
							</dt>
							<dd>
								{ i18n.language === 'ru' && <time> июнь 2018 года</time> }
								{ i18n.language === 'en' && <time> june 2018</time> }
								<br />
								Wordpress, HTML, LESS, JS
							</dd>
							<dt>
								<a href="https://ahec-tax.co.il/" dir="rtl" lang="he">ארצי, חיבה, אלמקייס, כהן — פתרונות מיסוי</a>
							</dt>
							<dd>
								{ i18n.language === 'ru' && <time> октябрь 2017 года</time> }
								{ i18n.language === 'en' && <time> october 2017</time> }
								<br />
								Wordpress, HTML, LESS, JS, PHP
							</dd>
						</dl>

						<h3>
							{ i18n.language === 'ru' && 'Рекламное агентство «Клён»' }
							{ i18n.language === 'en' && 'Advertising agency "Klen"' }
						</h3>

						{ i18n.language === 'ru' && <h4>ноябрь 2009 — 2016</h4> }
						{ i18n.language === 'en' && <h4>november 2009 — 2016</h4> }

						{ i18n.language === 'ru' && <p>Работал над созданием, развитием и поддержкой сайтов агентства. В свободное время писал сайты для клиентов агентства или удаленно занимался фрилансом. Для рекламного агентства создал и поддерживал сайты:</p> }
						{ i18n.language === 'en' && <p>I worked on the creation, development and support of agency sites. In my free time I wrote websites for clients of an agency or remotely freelancing. For an advertising agency created and maintained sites:</p> }

						<dl>
							<dt>
								<a href="http://klen.by/">
									{ i18n.language === 'ru' && 'Рекламное агентство «Клён»' }
									{ i18n.language === 'en' && 'Advertising agency Klen' }
								</a>
							</dt>
							<dd>
								<time>
									{ i18n.language === 'ru' && 'июль 2015 года' }
									{ i18n.language === 'en' && 'jule 2015' }
								</time>
								<br />
								Symphony CMS, XSLT
							</dd>
							<dt>
								<a href="http://skinali.by/">
									{ i18n.language === 'ru' && 'Каталог скиналей' }
									{ i18n.language === 'en' && 'Skinali catalog' }
								</a>
							</dt>
							<dd>
								<time>
									{ i18n.language === 'ru' && 'сентябрь 2015 года' }
									{ i18n.language === 'en' && 'september 2015' }
								</time>
								<br />
								Symphony CMS, XSLT
							</dd>
						</dl>

						<p>
							{ i18n.language === 'ru' && 'Фриланс-работы:' }
							{ i18n.language === 'en' && 'Fleelance works:' }
						</p>
						<dl>
							<dt>
								<a href="https://fitness.edu.au/">Australian Institute of Fitness</a>
							</dt>
							<dd>
								Symphony CMS, XSLT, HTML, CSS, JS, UIKit
							</dd>
							<dt>
								<a href="http://ratur.by/">
									{ i18n.language === 'ru' && 'Буровая компания' }
									{ i18n.language === 'en' && 'Drilling company' }
								</a>
							</dt>
							<dd>
								Wordpress
							</dd>
							<dt>
								<a href="http://teplo-vitebsk.by/">
									{ i18n.language === 'ru' && 'Магазин отопительного оборудования' }
									{ i18n.language === 'en' && 'Heating Equipment Store' }
								</a>
							</dt>
							<dd>
								Wordpress, WooCommerce
							</dd>
						</dl>

						<h3>Creative People</h3>

						{ i18n.language === 'ru' && <h4>сентябрь 2011 — ноябрь 2012,<br />ноябрь 2015 — май 2017</h4> }
						{ i18n.language === 'en' && <h4>september 2011 — november 2012,<br />november 2015 — may 2017</h4> }

						<p>
							{ i18n.language === 'ru' && 'Работал удаленно технологом в отделе поддержки. Занимался сопровождением сайтов клиентов:' }
							{ i18n.language === 'en' && 'Worked remotely as a technologist in the support department. Engaged in the maintenance of customer sites:' }
						</p>

						<ul>
							<li><a href="http://polyusgold.com/ru/">
								{ i18n.language === 'ru' && 'Полюс' }
								{ i18n.language === 'en' && 'Polyus' }
							</a></li>
							<li><a href="http://stada.ru/">
								{ i18n.language === 'ru' && 'Штада' }
								{ i18n.language === 'en' && 'Stada' }
							</a></li>
							<li>
								{ i18n.language === 'ru' && 'Природа Amway' }
								{ i18n.language === 'en' && 'Amway' }
							</li>
							<li>
								{ i18n.language === 'ru' && 'Фитнес клубы «Физика»' }
								{ i18n.language === 'en' && 'Fitness club "Fizika"' }
							</li>
							<li>Merz</li>
							<li><a href="http://carpethouse.ru/">Carpet House</a></li>
							<li>Saimaa</li>
							<li>Braer</li>
						</ul>

						<p>
							{ i18n.language === 'ru' && 'Версткой шаблонов:' }
							{ i18n.language === 'en' && 'Frontend:' }
						</p>

						<ul>
							<li><a href="http://www.at-consulting.ru/">AT Consulting</a></li>
							<li>DSMU</li>
						</ul>

						<p>Кроме этого собрал два сайта на Symphony CMS:</p>

						<dl>
							<dt><a href="http://jenialubich.com/">Сайт певицы Жени Любич</a></dt>
							<dd>сборка сайта, Symphony CMS;</dd>
							<dt>Ингруп СтС</dt>
							<dd>сборка сайта, Symphony CMS.</dd>
						</dl>

						<h3>Студия Артемия Лебедева</h3>
						<h4>ноябрь 2006 — ноябрь 2009</h4>

						<p>Работал кодером в отделе поддержки. Занимался сопровождением сайтов клиентов на системах <a href="https://imprimatur.artlebedev.ru/">Imprimatur и Imprimatur II</a>:</p>

						<ul>
							<li><a href="https://www.artlebedev.ru/everything/vbank/site2/">Банк Возрождение</a>;</li>
							<li><a href="https://www.artlebedev.ru/everything/gazprom/gazfond-site2/">НПФ «Газфонд»</a>;</li>
							<li><a href="https://www.artlebedev.ru/everything/caravan/">Караван</a>;</li>
							<li><a href="https://www.artlebedev.ru/everything/medicina/site2/">Медицина</a>;</li>
							<li><a href="https://www.artlebedev.ru/everything/imb/site2/">Международный московский банк</a>;</li>
							<li><a href="https://www.artlebedev.ru/everything/nomos/site/">Номос-банк</a>;</li>
							<li><a href="https://www.artlebedev.ru/everything/spb/site2/">Сайт города Санкт-Петербурга</a>;</li>
							<li><a href="https://www.artlebedev.ru/everything/hp/site4/">Hewlett-Packard</a>.</li>
						</ul>
					</section>

					<section id="education">
						<h2>{t( 'education' )}</h2>
						<dl>
							<dt>
								<b>ВГУ им. Машерова</b>, 1999 — 2004
							</dt>
							<dd>
								Высшее, техническое.<br />
								Специальности: математик-программист, преподаватель математики и информатики.
							</dd>
						</dl>
					</section>

			</Layout>
		)
	}
}


export default withNamespaces( 'common' )( Index )