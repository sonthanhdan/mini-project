export const debounce = <T extends Function>(cb: T, wait = 20) => {
    let h: string | number | NodeJS.Timeout | undefined = 0;
    let callable = (...args: any) => {
        clearTimeout(h);
        h = setTimeout(() => cb(...args), wait);
    };
    return <T>(<any>callable);
}