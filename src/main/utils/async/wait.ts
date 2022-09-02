export default function wait(ms: number): Promise<void> {
    return new Promise(res => setInterval(() => res(), ms));
}
