declare const websites: {
    whitelist: Set<string>;
    redirects: {
        [x: string]: ((url: string) => string) | undefined;
    };
};
export default websites;
