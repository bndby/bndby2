/**
 *
 */
import React from 'react';
import Logo from '../Logo/Logo';
import Navigation from '../Navigation/Navigation';

interface LayoutProps {
  children: React.ReactNode;
}

/**
 *
 * @param {*} props
 */
const Layout: React.FC<LayoutProps> = ({ children }) => (
  <div className="layout">
    <div className="layout__logo">
      <Logo />
    </div>
    <div className="layout__navigation">
      <Navigation />
    </div>
    <div className="layout__content">
      {children}
      <hr />
    </div>
  </div>
);

export default Layout;
