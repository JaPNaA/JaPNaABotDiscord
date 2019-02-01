declare type JSONType = string | string[] | number | number[] | boolean | boolean[] | JSONObject | JSONObject[];
declare type JSONObject = {
    [x: string]: JSONType;
};
export { JSONObject, JSONType };
