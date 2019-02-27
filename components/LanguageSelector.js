/**
 * 
 */
import { i18n, withNamespaces } from '../i18n'
import React from 'react'

/**
 * 
 */
class LanguageSelector extends React.Component {
	static async getInitialProps() {
		return {
			namespacesRequired: ['common']
		}
	}

	render(){

		return (
			<div className="languageselector">
				<button style={{
					fontWeight: i18n.language !== 'ru' ? 'bold' : 'normal'
				}} onClick={() => i18n.changeLanguage( 'en' )}>
					Eng
				</button>
				<button style={{
					fontWeight: i18n.language === 'ru' ? 'bold' : 'normal'
				}} onClick={() => i18n.changeLanguage( 'ru' )}>
					Рус
				</button>
				<style jsx>{`
					.languageselector {
						display: flex;
						margin-top: 1rem;
					}

					button {
						appearence: none;
						display: inline-block;
						border: 0;
						background: transparent;
						padding: 0;
						margin-right: 1rem;
						cursor: pointer;
						font-weight: bold;
					}

					button:last-child {
						margin-right: 0;
						font-weight: normal;
					}
				`}</style>
			</div>
		)
	}
}

export default withNamespaces('common')( LanguageSelector )