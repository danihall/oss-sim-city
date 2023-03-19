import { NavLink } from "react-router-dom";

import { PATHS } from "../../constants";

import css from "./Nav.module.scss";

const Nav = () => {
  return (
    <nav className={css["app-nav"]}>
      <ul>
        {Object.entries(PATHS).map(([path, text]) => {
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
