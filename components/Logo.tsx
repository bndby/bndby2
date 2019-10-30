/**
 *
 */
import React from "react";
import Link from "next/link";

import "./logo.css";

/**
 *
 */
class Logo extends React.Component {
  render() {
    return (
      <div className="logo">
        <Link href="/">
          <a>
            <img className="logo__image" src="/static/images/logo.svg" />
          </a>
        </Link>
      </div>
    );
  }
}

/**
 *
 */
export default Logo;
