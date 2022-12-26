type JSONType = string | string[] | number | number[] | boolean | boolean[] | JSONObject | JSONType[];
type JSONObject = {
    [x: string]: JSONType;
};
export { JSONObject, JSONType };
