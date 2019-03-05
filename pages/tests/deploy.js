/**
 * 
 */
import Head from 'next/head'
import Layout from '../../components/Layout'
import Highlight from 'react-highlight'

import 'highlight.js/styles/vs.css'

/**
 * 
 */
export default () => (
	<Layout>
		<Head>
			<title>Deploy A Next.js App on Heroku</title>
		</Head>

		<h2>1. Create a project</h2>
		<p>Open your terminal and navigate to the location you would like to save the project then type the following in your terminal.</p>
		<Highlight language="bash">{`mkdir my-app
cd my-app
npm init -y
npm install --save react react-dom next
touch .gitignore
mkdir pages
cd pages
touch index.js
cd ..`}</Highlight>

		<h2>2. Add Code to Index.js</h2>
		<Highlight language="javascript">{`const Index = () => (
	<div>
		<p>Hello World!</p>
	</div>
)
export default Index`}
		</Highlight>

		<h2>3. Add Code to .gitignore</h2>
		<Highlight>{`node_modules/
.next/
*.log`}</Highlight>

		<h2>4. Modify package.json</h2>
		<Highlight language="javascript">{`"scripts": {
	"dev": "next",
	"build": "next build",
	"start": "next start -p $PORT",
	"heroku-postbuild": "npm run build",
	"test": "echo \\"Error: no test specified\\" && exit 1"
},`}</Highlight>

		<h2>5. Push to Github</h2>
		<p>Create a new repository in your browser on Github. Then type the following in your root directory.</p>
		<Highlight language="bash">{`git init
git add .
git commit -m "First Commit"
git remote add origin https://github.com/{username}/{repositoryname}
git push origin master`}</Highlight>

		<h2>6. Create Heroku App</h2>
		<Highlight language="bash">{'heroku create my-app'}</Highlight>

		<h2>7. Deploy on Heroku</h2>
		<ol>
			<li>Open your browser and sign into Heroku</li>
			<li>Navigate to the “Dashboard”</li>
			<li>Select your newly created app</li>
			<li>Click “Deploy”</li>
			<li>Under “Deployment Method” select “Github”</li>
			<li>Add repository name (username/repositoryname)</li>
			<li>Click “Search”</li>
			<li>Click “Connect”</li>
			<li>Select Branch</li>
			<li>Click “Deploy Branch”</li>
			<li>Click “View”</li>
		</ol>
		<style global jsx>{`
			pre {
				font-size: 0.75rem;
				overflow: auto;
			}
		`}</style>

	</Layout>
)