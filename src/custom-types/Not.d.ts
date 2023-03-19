type Not<TypesToExclude, BaseTypes> = BaseTypes extends TypesToExclude
  ? never
  : BaseTypes;

export type { Not };
