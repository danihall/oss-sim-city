import css from "./DayNightSVG.module.scss";

interface IDayNightSVG {
  is_night: boolean;
}

const DayNightSVG = ({ is_night = true }: IDayNightSVG) => {
  const className = [css["svg-day-night"], is_night ? "night" : ""].join(" ");

  return <svg className={className} aria-hidden="true"></svg>;
};

export { DayNightSVG };
