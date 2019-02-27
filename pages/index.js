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

						{ i18n.language === 'ru' && <p>апрель 2017 — настоящее время</p> }
						{ i18n.language === 'en' && <p>april 2017 — now</p> }

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

						{ i18n.language === 'ru' && <p>ноябрь 2009 — 2016</p> }
						{ i18n.language === 'en' && <p>november 2009 — 2016</p> }

						{ i18n.language === 'ru' && <p>Работал над созданием, развитием и поддержкой сайтов агентства. В свободное время писал сайты для клиентов агентства или удаленно занимался фрилансом. Для рекламного агентства создал и поддерживал сайты:</p> }
						{ i18n.language === 'en' && <p>I worked on the creation, development and support of agency sites. In my free time I wrote websites for clients of an agency or remotely freelancing. For an advertising agency created and maintained sites:</p> }

						<dl>
							<dt>
								<a href="http://klen.by/">Рекламное агентство «Клён»</a>
							</dt>
							<dd>
								<time>июль 2015 года</time>
								<br />
								Symphony CMS, XSLT
							</dd>
							<dt>
								<a href="http://skinali.by/">Каталог скиналей</a>
							</dt>
							<dd>
								<time>сентябрь 2015 года</time>
								<br />
								Symphony CMS, XSLT
							</dd>
						</dl>

						<p>Фриланс-работы:</p>

						<dl>
							<dt>
								<a href="https://fitness.edu.au/">Australian Institute of Fitness</a>
							</dt>
							<dd>
								Symphony CMS, XSLT, UIKit
							</dd>
							<dt>
								<a href="http://ratur.by/">Буровая компания</a>
							</dt>
							<dd>
								Wordpress
							</dd>
							<dt>
								<a href="http://teplo-vitebsk.by/">Магазин отопительного оборудования</a>
							</dt>
							<dd>
								Wordpress, WooCommerce
							</dd>
						</dl>

						<h3>Creative People</h3>

						{ i18n.language === 'ru' && <p>сентябрь 2011 — ноябрь 2012, ноябрь 2015 — май 2017</p> }
						{ i18n.language === 'en' && <p>september 2011 — november 2012, november 2015 — may 2017</p> }

						<p>Работал удаленно технологом в отделе поддержки. Занимался сопровождением сайтов клиентов:</p>

						<ul>
							<li><a href="http://polyusgold.com/ru/">Полюс</a> — контент-менеджмент, Bitrix;</li>
							<li><a href="http://stada.ru/">Штада</a> — контент-менеджмент, Bitrix;</li>
							<li>Природа Amway — контент-менеджмент, Bitrix;</li>
							<li>Фитнес клубы «Физика» — поддержка и доработка сайта, «Коробочка»;</li>
							<li>Merz — поддержка и доработка сайта;</li>
							<li><a href="http://carpethouse.ru/">Carpet House</a> — поддержка сайта;</li>
							<li>Водка Saimaa — поддержка сайта;</li>
							<li>Braer — поддержка и доработка сайта.</li>
						</ul>

						<p>Версткой шаблонов:</p>

						<ul>
							<li><a href="http://www.at-consulting.ru/">AT Consulting</a> — верстка шаблонов;</li>
							<li>DSMU — верстка шаблонов.</li>
						</ul>

						<p>Кроме этого собрал два сайта на Symphony CMS:</p>

						<ul>
							<li><a href="http://jenialubich.com/">Сайт певицы Жени Любич</a> — сборка сайта, Symphony CMS;</li>
							<li>Ингруп СтС — сборка сайта, Symphony CMS.</li>
						</ul>

						<h3>Студия Артемия Лебедева</h3>
						<p>ноябрь 2006 — ноябрь 2009</p>

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