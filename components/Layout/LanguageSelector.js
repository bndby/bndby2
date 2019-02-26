import { i18n, withNamespaces } from '../../i18n'
import React from 'react'

class LanguageSelector extends React.Component {

	render(){
		const { t } = this.props

		return (
			<button
				type='button'
				onClick={() => i18n.changeLanguage( i18n.language === 'en' ? 'ru' : 'en' )}
			>
				{ t('language-selector') }
			</button>
		)
	}
}

export default withNamespaces('common')( LanguageSelector )