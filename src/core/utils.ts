/**
 * @param data arraylike data
 * @param render describe rendering logic
 */
const map = <T>(data: T[], render: (data: T) => string) =>
    data.map(render).reduce((string, curr) => `${string}${curr}`, "")

type Attributes<Value> = Partial<Record<string, Value>>
/**
 * @param attributes `DOM` attributes
 */
const setAttributes = (attributes: Attributes<string> | undefined): string =>
    attributes
        ? Object.entries(attributes)
              .map(([key, value]) => `${key}=${value}`)
              .reduce((attr, curr) => `${attr} ${curr}`, "")
        : ""

export { map, setAttributes }
