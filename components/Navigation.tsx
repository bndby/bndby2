/**
 *
 */
import React from "react";

import "./navigation.css";

/**
 *
 */
class Navigation extends React.Component {
  render() {
    return (
      <div className="navigation">
        <ul>
          <li>
            <a className="navigation__email" href="mailto:info@bnd.by">
              info@bnd.by
            </a>
          </li>
          <li>
            <a className="navigation__github" href="https://github.com/bndby">
              /bndby
            </a>
          </li>
        </ul>
      </div>
    );
  }
}

/**
 *
 */
export default Navigation;
