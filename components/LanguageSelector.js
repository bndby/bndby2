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
		const { t } = this.props

		return (
			<div className="languageselector">
				<button className="link" onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ru' : 'en')}>
          			{t('language-selector')}
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
						cursor: pointer;
					}
				`}</style>
			</div>
		)
	}
}

export default withNamespaces('common')( LanguageSelector )