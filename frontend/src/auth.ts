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
    const headers = new Headers(init.headers);
    const t = getToken();
    if (t) {
        headers.set('Authorization', `Bearer ${t}`);
    }
    const req = new Request(path, { ...init, headers, credentials: 'include' });
    const res = await fetch(req);
    if (res.status === 401 && allowRefresh) {
        const refreshRes = await fetch("/api/auth/refresh", {
            method: 'POST',
            credentials: 'include'
        });
        if (refreshRes.ok) {
            const { accessToken } = await refreshRes.json();
            setToken(accessToken);
            return fetch(path, init);
        } else {
            clearToken();
            throw new Error('Unauthorized (refresh failed)');
        }
    } else {
        return res;
    }
}
export async function checkValidity() {
    const token = getToken();
    if (!token) {
        return false;
    }
    const res = await fetchFromAPI("/auth/validate",{
        method: "GET"
    });
    return res.status===200;
}