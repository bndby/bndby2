/**
 *
 */
import Logo from "./Logo";
import Navigation from "./Navigation";

import "./layout.css";
import Link from "next/link";

/**
 *
 * @param {*} props
 */
const Layout = props => (
  <div className="layout">
    <div className="layout__logo">
      <Logo />
      {/*
      <div className="languageselector">
        <Link href="/ru">
          <a>RU</a>
        </Link>
        <style jsx>{`
          .languageselector {
            display: flex;
            margin-top: 1rem;
          }

          a {
            appearence: none;
            display: inline-block;
            border: 0;
            background: transparent;
            padding: 0;
            cursor: pointer;
          }
        `}</style>
		</div>*/}
    </div>
    <div className="layout__navigation">
      <Navigation />
    </div>
    <div className="layout__content">
      {props.children}
      <hr />
    </div>
  </div>
);

export default Layout;
