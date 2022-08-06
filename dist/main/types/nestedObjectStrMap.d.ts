import ObjectStrMap from "./objectStrMap";
declare type NestedObject<T = ObjectStrMap> = {
    [x: string]: T;
};
export default NestedObject;
