import React from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';

const Home = () => (
  <Layout>
    <Head>
      <title>Bandarenka Yury</title>
    </Head>

    <h1>CV</h1>

    <section id="skills">
      <h2>Skills</h2>
      <ol>
        <li>
          HTML, <small>Markdown</small>;
        </li>
        <li>
          CSS, <small>LESS, SCSS, Stylus, PostCSS</small>;
        </li>
        <li>JavaScript ES5/ES6+, Typescript;</li>
        <li>React, Angular 2+;</li>
        <li>React Native</li>
        <li>XML, XSLT, XPath, SVG;</li>
        <li>PHP, Parser;</li>
        <li>MySQL;</li>
        <li>WAI-ARIA;</li>
        <li>Wordpress, Symphony CMS, Mediawiki, Tilda, Github Pages, Cloudflare.</li>
        <li>Gulp, Webpack, Git</li>
        <li>Linux, Windows</li>
      </ol>
    </section>

    <section id="projects">
      <h2>Open source projects</h2>

      <h3>xsltdev</h3>
      <p>
        Documentation about web technologies: <a href="https://xsltdev.ru/">xsltdev.ru</a>
      </p>
      <p>
        Github repositories: <a href="https://github.com/xsltdev">github.com/xsltdev</a>
      </p>

      <h3>Fuflomycin</h3>
      <p>
        Database with bad drugs in JSON format.{' '}
        <a href="https://play.google.com/store/apps/details?id=com.fuflomycin_rn">
          React native app
        </a>
        , <a href="https://t.me/FuflomycinBot">Telegram bot</a> for use this database.
      </p>
      <p>
        Github repositories: <a href="https://github.com/fuflomycin">github.com/fuflomycin</a>
      </p>
    </section>

    <section id="experience">
      <h2>Experience</h2>
      
      <h3>
        <img src="https://ru.wargaming.net/wgsw_public/logo_120.png" alt="Wargaming.net" />
        <br />
        Wargaming
      </h3>
      <h4>May 2020 — Now</h4>
        
      <h3>
        <img src="/static/images/bnweb.svg" alt="BN Studio" />
        <br />
        BN Studio
      </h3>
      <h4>April 2017 — May 2020</h4>

      <dl>
        <dt>
          <a href="https://geodata.co.il/">מערכת ניהול ועדת תמרור</a>
        </dt>
        <dd>
          <time>July 2019</time>
          <br />
          Frontend development: Angular 7, Typescript, PrimeNG, REST API
        </dd>

        <dt>
          <a href="https://nbogorad.com/">Natali Bogorad&#8217;s Design cafe</a>
        </dt>
        <dd>
          <time>March 2019</time>
          <br />
          Development: XSLT, PostCSS, CSSNext, ES6, Webpack, Gulp
        </dd>

        <dt>
          <a href="https://moscowseasons.com/">Moscow Seasons</a>
        </dt>
        <dd>
          <time>Febrary 2019</time>
          <br />
          Support: React, Stylus
        </dd>

        <dt>
          <a href="https://www.nadlan.gov.il/"> אתר הנדל״ן הממשלתי </a>
        </dt>
        <dd>
          <time>December 2018</time>
          <br />
          Support: HTML, CSS, AngularJS, Grunt
        </dd>

        <dt>
          <a href="https://bnweb.studio">BN Studio</a>
        </dt>
        <dd>
          <time>August 2018</time>
          <br />
          Development: HTML, LESS, JS, Gulp, Cloudflare
        </dd>
        <dt>
          <a href="https://skirollers.ru/">Ski Rollers</a>
        </dt>
        <dd>
          <time>June 2018</time>
          <br />
          Development: Wordpress, HTML, LESS, JS
        </dd>
        <dt>
          <a href="https://ahec-tax.co.il/" dir="rtl" lang="he">
            ארצי, חיבה, אלמקייס, כהן — פתרונות מיסוי
          </a>
        </dt>
        <dd>
          <time>October 2017</time>
          <br />
          Support: Wordpress, HTML, LESS, JS, PHP
        </dd>
      </dl>

      <h3>
        <img src="/static/images/klen.png" alt="Klen" />
        <br />
        Advertising agency «Klen»
      </h3>
      <h4>November 2009 — 2016</h4>

      <p>
        I worked on the creation, development and support of agency sites. In my free time I wrote
        websites for clients of an agency or remotely freelancing. For an advertising agency created
        and maintained sites:
      </p>

      <dl>
        <dt>
          <a href="http://klen.by/">Advertising agency Klen</a>
        </dt>
        <dd>
          <time>Jule 2015</time>
          <br />
          Symphony CMS, XSLT
        </dd>
        <dt>
          <a href="http://skinali.by/">Skinali catalog</a>
        </dt>
        <dd>
          <time>September 2015</time>
          <br />
          Symphony CMS, XSLT
        </dd>
      </dl>

      <p>Fleelance works:</p>
      <dl>
        <dt>
          <a href="https://fitness.edu.au/">Australian Institute of Fitness</a>
        </dt>
        <dd>Symphony CMS, XSLT, HTML, CSS, JS, UIKit</dd>

        <dt>
          <a href="http://ratur.by/">Drilling company</a>
        </dt>
        <dd>Wordpress</dd>

        <dt>
          <a href="http://teplo-vitebsk.by/">Heating Equipment Store</a>
        </dt>
        <dd>Wordpress, WooCommerce</dd>
      </dl>

      <h3>
        <img src="/static/images/cpeople.svg" alt="Creative People" />
        <br />
        Creative People
      </h3>
      <h4>
        November 2015 — May 2017,
        <br />
        September 2011 — November 2012,
      </h4>

      <p>
        Worked remotely as a technologist in the support department. Engaged in the maintenance of
        customer sites:
      </p>

      <ul>
        <li>
          <a href="http://polyusgold.com/ru/">Polyus</a>
        </li>
        <li>
          <a href="http://stada.ru/">Stada</a>
        </li>
        <li>Amway</li>
        <li>Fitness club "Fizika"</li>
        <li>Merz</li>
        <li>
          <a href="http://carpethouse.ru/">Carpet House</a>
        </li>
        <li>Saimaa</li>
        <li>Braer</li>
      </ul>

      <p>Frontend:</p>

      <ul>
        <li>
          <a href="http://www.at-consulting.ru/">AT Consulting</a>
        </li>
        <li>DSMU</li>
      </ul>

      <p>Backend on Symphony CMS:</p>

      <ul>
        <li>
          <a href="http://jenialubich.com/">Jenia Lubich</a>
        </li>
        <li>Ingroup STS</li>
      </ul>

      <h3>
        <img src="/static/images/als.svg" alt="ALS" />
        <br />
        Art Lebedev Studio
      </h3>
      <h4>November 2006 — November 2009</h4>

      <p>
        I worked as a coder in the support department. Engaged in the maintenance of client sites on
        systems <a href="https://imprimatur.artlebedev.ru/">Imprimatur и Imprimatur II</a>:
      </p>

      <ul>
        <li>
          <a href="https://www.artlebedev.ru/everything/vbank/site2/">Vozrozhdenie</a>;
        </li>
        <li>
          <a href="https://www.artlebedev.ru/everything/gazprom/gazfond-site2/">Gazfond</a>;
        </li>
        <li>
          <a href="https://www.artlebedev.ru/everything/caravan/">Caravan</a>;
        </li>
        <li>
          <a href="https://www.artlebedev.ru/everything/medicina/site2/">Medicina</a>;
        </li>
        <li>
          <a href="https://www.artlebedev.ru/everything/imb/site2/">IMB</a>;
        </li>
        <li>
          <a href="https://www.artlebedev.ru/everything/nomos/site/">Nomos</a>;
        </li>
        <li>
          <a href="https://www.artlebedev.ru/everything/spb/site2/">St. Petersburg</a>;
        </li>
        <li>
          <a href="https://www.artlebedev.ru/everything/hp/site4/">Hewlett-Packard</a>.
        </li>
      </ul>
    </section>

    <section id="speaker">
      <h2>Speaker</h2>

      <h3>MiniQ #20</h3>
      <h4>November 2019</h4>
      <p>
        <a href="https://community-z.com/events/miniq-vitebsk-20/talks/1741">Forward to the Past</a>
        , <a href="https://community-z.com/communities/vitebsk-miniq/albums/50">Photos</a>,{' '}
        <a href="https://www.slideshare.net/vitebsk-miniq/ss-197345518">Slides</a>,{' '}
        <a href="https://github.com/bndby/doklad-jamstack">Slides on Github</a>
      </p>

      <h3>MiniQ #14</h3>
      <h4>April 2019</h4>
      <p>
        <a href="https://communities.by/events/miniq-vitebsk-14/talks/684">CSS Practice</a>,{' '}
        <a href="https://community-z.com/communities/vitebsk-miniq/albums/7">Photos</a>,{' '}
        <a href="https://www.slideshare.net/vitebsk-miniq/css-142758766">Slides</a>,{' '}
        <a href="https://github.com/bndby/doklad-css">Slides on Github</a>
      </p>
    </section>

    <section id="education">
      <h2>Education</h2>
      <dl>
        <dt>
          <b>VSU Masherova</b>, 1999 — 2004
        </dt>
        <dd>
          Higher technical
          <br />
          Specialties: software mathematician, teacher of mathematics and computer science
        </dd>
      </dl>
    </section>
  </Layout>
);

export default Home;
