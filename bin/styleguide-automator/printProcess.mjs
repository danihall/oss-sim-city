import process from "node:process";

const printProcessSuccess = (
  process_duration,
  components_name_and_path,
  function_prop_detected
) => {
  process.stdout.write(
    `  components exports and render specs created in ${process_duration
      .toString()
      .slice(0, 4)}ms:\n`
  );
  process.stdout.write(
    components_name_and_path
      .map(({ component_name }) => `    <${component_name}/>`)
      .join("\n") + "\n"
  );
  if (function_prop_detected.length) {
    process.stdout.write(
      `  props declaring a Function were discarded:\n    ${function_prop_detected.join(
        "    \n"
      )}\n  Styleguide-automator cannot generate a fake value for these kind of props\n`
    );
  }
};

const printProcessError = (reason) => {
  process.stderr.write(
    `\n  Styleguide-automator encountered an error:
        ${reason}
    Process exited.\n`
  );
};

const printInvalidConfig = (message) => {
  process.stderr.write(`\n  ${message}\n`);
};

export { printProcessSuccess, printProcessError, printInvalidConfig };
