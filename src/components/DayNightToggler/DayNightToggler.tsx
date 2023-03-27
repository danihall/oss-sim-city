import { useState } from "react";

import css from "./DayNightToggler.module.scss";

const DayNightToggler = () => {
  const [is_pressed, setPressed] = useState(false);

  const handleClick = () => setPressed(!is_pressed);

  return (
    <button
      type="button"
      className={css["button-day-night"]}
      onClick={handleClick}
      aria-pressed={is_pressed}
    >
      toggle between day and night
      <svg aria-hidden="true" focusable="false"></svg>
    </button>
  );
};

export { DayNightToggler };
