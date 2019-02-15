/**
 * 
 */
import Layout from '../components/Layout'
import Age from '../components/Age'
import Head from 'next/head'

/**
 * 
 */
import './index.css'

/**
 * 
 */
export default () => (
	<Layout>
		<Head>
			<title>Бондаренко Юрий, веб-разработчик</title>
		</Head>
		<h1>Бондаренко Юрий, веб-разработчик</h1>
		<p>Меня зовут Бондаренко Юрий, мне <Age />. Люблю жену и дочь. Занимаюсь созданием сайтов, баз знаний и онлайн-справочников.</p>

		<ul>
			<li><a href="https://github.com/bndby/bndby">Github</a></li>
			<li>Telegram: <a href="https://t.me/bndby">@bndby</a></li>
			<li>E-mail: <a href="mailto:by@klen.by">by@klen.by</a></li>
		</ul>

		<hr />

		<div className="exp">
			<div style={{gridArea: 'n'}}>
				<h2>Навыки</h2>
				<ol>
					<li>HTML, Markdown;</li>
					<li>CSS, LESS, SCSS;</li>
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
			</div>

			<div style={{gridArea: 'o'}}>
				<h2>Образование</h2>
				<p>
					<b>ВГУ им. Машерова</b>, 1999 — 2004<br />
					Высшее, техническое.<br />
					Специальности: математик-программист, преподаватель математики и информатики.
				</p>
			</div>

			<div style={{gridArea: 'h'}}>
				<h2>Хобби</h2>
				<p>Катаюсь на велосипеде, читаю, фотографирую, поддерживаю несколько личных проектов:</p>
				<ul>
					<li><a href="https://xsltdev.ru/">xsltdev.ru</a> — справочники по HTML, CSS, XSLT, XPath;</li>
					<li><a href="https://swgg.ru/">swgg.ru</a> — фан-форум по игре Star Wars.</li>
				</ul>
			</div>
		</div>

		<hr />

		<h2>Опыт работы</h2>

		<h3>BN Studio</h3>
		<p>апрель 2017 — настоящее время</p>

		<ol>
			<li><a href="https://bnweb.studio">BN Studio</a>, <time>август 2018 года</time><br />Статичный HTML сайт: HTML, LESS, JS, Gulp, Cloudflare</li>
			<li><a href="https://skirollers.ru/">Ski Rollers</a>, <time>июнь 2018 года</time><br />Простой сайт-визитка: Wordpress, LESS</li>
			<li><a href="https://ahec-tax.co.il/" dir="rtl">ארצי, חיבה, אלמקייס, כהן — פתרונות מיסוי</a>, <time>октябрь 2017 года</time><br />Редизайн мультиязычного корпоративного сайта: Wordpress, LESS</li>
		</ol>

		<h3>Рекламное агентство «Клён»</h3>
		<p>ноябрь 2009 — 2016</p>

		<p>Работал над созданием, развитием и поддержкой сайтов агентства. В свободное время писал сайты для клиентов агентства или удаленно занимался фрилансом. Для рекламного агентства создал и поддерживал сайты:</p>

		<ol>
			<li><a href="http://klen.by/">Рекламное агентство «Клён»</a>, <time>июль 2015 года</time><br />Корпоративный сайт: Symphony CMS, XSLT</li>
			<li><a href="http://skinali.by/">Каталог скиналей</a>, <time>сентябрь 2015 года</time><br />Фотокаталог: Symphony CMS, XSLT</li>
		</ol>

		<p>Фриланс-работы:</p>

		<ol>
			<li><a href="https://fitness.edu.au/">Australian Institute of Fitness</a>, <br />Образовательное учреждение: Symphony CMS, XSLT, UIKit</li>
			<li><a href="http://ratur.by/">Буровая компания</a>, <br />Корпоративный сайт: Wordpress</li>
			<li><a href="http://teplo-vitebsk.by/">Магазин отопительного оборудования</a>, <br />Интернет-магазин: Wordpress, WooCommerce</li>
		</ol>

		<h3>Creative People</h3>
		<p>сентябрь 2011 — ноябрь 2012, ноябрь 2015 — май 2017</p>

		<p>Работал удаленно технологом в отделе поддержки. Занимался сопровождением сайтов клиентов:</p>

		<ol>
			<li><a href="http://polyusgold.com/ru/">Полюс</a> — контент-менеджмент, Bitrix;</li>
			<li><a href="http://stada.ru/">Штада</a> — контент-менеджмент, Bitrix;</li>
			<li>Природа Amway — контент-менеджмент, Bitrix;</li>
			<li>Фитнес клубы «Физика» — поддержка и доработка сайта, «Коробочка»;</li>
			<li>Merz — поддержка и доработка сайта;</li>
			<li><a href="http://carpethouse.ru/">Carpet House</a> — поддержка сайта;</li>
			<li>Водка Saimaa — поддержка сайта;</li>
			<li>Braer — поддержка и доработка сайта.</li>
		</ol>

		<p>Версткой шаблонов:</p>

		<ol>
			<li><a href="http://www.at-consulting.ru/">AT Consulting</a> — верстка шаблонов;</li>
			<li>DSMU — верстка шаблонов.</li>
		</ol>

		<p>Кроме этого собрал два сайта на Symphony CMS:</p>

		<ol>
			<li><a href="http://jenialubich.com/">Сайт певицы Жени Любич</a> — сборка сайта, Symphony CMS;</li>
			<li>Ингруп СтС — сборка сайта, Symphony CMS.</li>
		</ol>

		<h3>Студия Артемия Лебедева</h3>
		<p>ноябрь 2006 — ноябрь 2009</p>

		<p>Работал кодером в отделе поддержки. Занимался сопровождением сайтов клиентов на системах <a href="https://imprimatur.artlebedev.ru/">Imprimatur и Imprimatur II</a>:</p>

		<ol>
			<li><a href="https://www.artlebedev.ru/everything/vbank/site2/">Банк Возрождение</a>;</li>
			<li><a href="https://www.artlebedev.ru/everything/gazprom/gazfond-site2/">НПФ «Газфонд»</a>;</li>
			<li><a href="https://www.artlebedev.ru/everything/caravan/">Караван</a>;</li>
			<li><a href="https://www.artlebedev.ru/everything/medicina/site2/">Медицина</a>;</li>
			<li><a href="https://www.artlebedev.ru/everything/imb/site2/">Международный московский банк</a>;</li>
			<li><a href="https://www.artlebedev.ru/everything/nomos/site/">Номос-банк</a>;</li>
			<li><a href="https://www.artlebedev.ru/everything/spb/site2/">Сайт города Санкт-Петербурга</a>;</li>
			<li><a href="https://www.artlebedev.ru/everything/hp/site4/">Hewlett-Packard</a>.</li>
		</ol>

		<hr />

		<h2>Предпочтения в работе</h2>

		<ul>
			<li>Люблю XSLT и задачи, связанные с преобразованием данных. Любимая CMS — Symphony CMS.</li>
			<li>Нравится структурировать большие объемы данных и проектировать семантические библиотеки и базы знаний на Mediawiki.</li>
		</ul>

		<p></p>
	</Layout>
)