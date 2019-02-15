import Layout from "../components/Layout";
import Head from 'next/head'

export default () => (
	<Layout>
		<Head>
			<title>Deploy A Next.js App on Heroku</title>
		</Head>
		<h1>Deploy A Next.js App on Heroku</h1>

		<h2>1. Create a project</h2>
		<p>Open your terminal and navigate to the location you would like to save the project then type the following in your terminal.</p>
		<pre>
		{`mkdir my-app
cd my-app
npm init -y
npm install --save react react-dom next
touch .gitignore
mkdir pages
cd pages
touch index.js
cd ..`}
		</pre>

		<h2>2. Add Code to Index.js</h2>
		<pre>
{`const Index = () => (
<div>
  <p>Hello World!</p>
</div>
)
export default Index`}
		</pre>

		<h2>3. Add Code to .gitignore</h2>
		<pre>
{`node_modules/
.next/
*.log`}
		</pre>

		<h2>4. Modify package.json</h2>
		<pre>
{`"scripts": {
  "dev": "next",
  "build": "next build",
  "start": "next start -p $PORT",
  "heroku-postbuild": "npm run build",
  "test": "echo \"Error: no test specified\" && exit 1"
},`}
		</pre>

		<h2>5. Push to Github</h2>
		<p>Create a new repository in your browser on Github. Then type the following in your root directory.</p>
		<pre>{`
git init
git add .
git commit -m "First Commit"
git remote add origin https://github.com/{username}/{repositoryname}
git push origin master`}
		</pre>

		<h2>6. Create Heroku App</h2>
		<pre>
heroku create my-app
		</pre>

		<h2>7. Deploy on Heroku</h2>
		<ol>
			<li>Open your browser and sign into Heroku</li>
			<li>Navigate to the “Dashboard”</li>
			<li> III Select your newly created app</li>
			<li> IV Click “Deploy”</li>
			<li> V Under “Deployment Method” select “Github”</li>
			<li> VI Add repository name (username/repositoryname)</li>
			<li> VII Click “Search”</li>
			<li> VIII Click “Connect”</li>
			<li> IX Select Branch</li>
			<li> X Click “Deploy Branch”</li>
			<li>XI Click “View”</li>
		</ol>
	</Layout>
)