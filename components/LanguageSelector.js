/**
 * 
 */
import { i18n, withNamespaces } from '../i18n'
import React from 'react'

/**
 * 
 */
class LanguageSelector extends React.Component {

	render(){

		return (
			<div className="languageselector">
				<button style={{
					fontWeight: i18n.language === 'en' ? 'bold' : 'normal'
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
					}

					button {
						appearence: none;
						display: inline-block;
						border: 0;
						background: transparent;
						padding: 0;
						margin-right: 1rem;
						cursor: pointer;
					}

					button:last-child {
						margin-right: 0;
					}
				`}</style>
			</div>
		)
	}
}

export default withNamespaces('common')( LanguageSelector )