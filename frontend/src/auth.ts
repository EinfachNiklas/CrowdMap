
export function getToken() {
    return localStorage.getItem('accessToken');
}
export function setToken(t: string) {
    localStorage.setItem('accessToken', t);
}
export function clearToken() {
    localStorage.removeItem('accessToken');
}
export function isLoggedIn() {
    return !!getToken();
}
export async function fetchFromAPI(path: RequestInfo | URL, init: RequestInit = {}, allowRefresh: boolean = true) {
    const toURL = (p: RequestInfo | URL): URL => {
        if (typeof p === 'string') return new URL(p, window.location.origin);
        if (p instanceof URL) return p;
        return new URL((p as Request).url, window.location.origin);
    };
    const apiOrigin = (() => {
        const u = toURL(path);
        return u.origin === window.location.origin;
    })();

    const attempt = async (token: string | null) => {
        const headers = new Headers(init.headers);
        if (token && apiOrigin) headers.set('Authorization', `Bearer ${token}`);
        const req = new Request(path, { ...init, headers, credentials: 'include' });
        return fetch(req);
    };
    let res = await attempt(getToken());
    if (res.status === 401 && allowRefresh && apiOrigin) {
        const refreshRes = await fetch("/api/auth/refresh", {
            method: 'POST',
            credentials: 'include'
        });
        if (!refreshRes.ok) {
            clearToken();
            throw new Error('Unauthorized (refresh failed)');
        }
        const { authToken } = await refreshRes.json();
        setToken(authToken);
        res = await attempt(authToken);
    }
    return res;

}
export async function checkValidity() {
    const token = getToken();
    if (!token) {
        return false;
    }
    try {
        const res = await fetchFromAPI("/api/auth/validate", { method: "GET" });
        return res.ok;
    } catch {
        return false;
    }
}