import { NavLink } from "react-router-dom";

import { NAV_PATHS } from "../../constants";

import css from "./Nav.module.scss";

const Nav = () => {
  return (
    <nav className={css["app-nav"]}>
      <ul>
        {Object.entries(NAV_PATHS).map(([path, text]) => {
          return (
            <li key={path}>
              <NavLink to={path}>{text}</NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export { Nav };
