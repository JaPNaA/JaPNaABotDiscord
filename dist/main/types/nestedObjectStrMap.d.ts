import ObjectStrMap from "./objectStrMap";
type NestedObject<T = ObjectStrMap> = {
    [x: string]: T;
};
export default NestedObject;
