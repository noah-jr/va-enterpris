import { BASE_URL } from './constants.js';

export interface ApiResult<T> {
  status: number;
  body: T;
  headers: Headers;
}

interface StoredCookie {
  name: string;
  value: string;
  path: string;
  httpOnly: boolean;
}

/**
 * Cliente HTTP com cookie jar que respeita `Path`, `Max-Age` e `Expires`, como um browser.
 * A sessão é mantida SÓ por cookies — tal como no frontend.
 */
export class ApiClient {
  /** chave: `${name};${path}` */
  private jar = new Map<string, StoredCookie>();

  private captureCookies(headers: Headers): void {
    const setCookie = headers.getSetCookie?.() ?? [];
    for (const raw of setCookie) {
      const [pair = '', ...attributes] = raw.split(';').map((p) => p.trim());
      const eq = pair.indexOf('=');
      if (eq <= 0) continue;
      const name = pair.slice(0, eq);
      const value = pair.slice(eq + 1);

      let path = '/';
      let expired = false;
      let httpOnly = false;
      for (const attribute of attributes) {
        const [key = '', ...rest] = attribute.split('=');
        const attrValue = rest.join('=');
        switch (key.toLowerCase()) {
          case 'path':
            path = attrValue || '/';
            break;
          case 'max-age':
            if (Number(attrValue) <= 0) expired = true;
            break;
          case 'expires':
            if (new Date(attrValue).getTime() <= Date.now()) expired = true;
            break;
          case 'httponly':
            httpOnly = true;
            break;
        }
      }

      const key = `${name};${path}`;
      if (expired || value === '') this.jar.delete(key);
      else this.jar.set(key, { name, value, path, httpOnly });
    }
  }

  private cookieHeader(requestPath: string): string | undefined {
    const pathname = requestPath.split('?')[0] ?? '/';
    const matching = [...this.jar.values()]
      .filter((c) => pathname === c.path || pathname.startsWith(c.path.endsWith('/') ? c.path : `${c.path}/`))
      // Cookies com path mais específico primeiro, como no browser.
      .sort((a, b) => b.path.length - a.path.length);
    if (matching.length === 0) return undefined;
    return matching.map((c) => `${c.name}=${c.value}`).join('; ');
  }

  /** Para asserções: cookie atualmente guardado (qualquer path). */
  getCookie(name: string): StoredCookie | undefined {
    return [...this.jar.values()].find((c) => c.name === name);
  }

  setCookie(name: string, value: string, path = '/'): void {
    this.jar.set(`${name};${path}`, { name, value, path, httpOnly: true });
  }

  clearCookies(): void {
    this.jar.clear();
  }

  async request<T>(
    method: string,
    path: string,
    options: { body?: unknown; headers?: Record<string, string> } = {},
  ): Promise<ApiResult<T>> {
    const headers: Record<string, string> = {
      ...(options.body !== undefined ? { 'content-type': 'application/json' } : {}),
      ...options.headers,
    };

    const cookieHeader = this.cookieHeader(path);
    if (cookieHeader) headers.cookie = cookieHeader;

    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });

    this.captureCookies(res.headers);

    const text = await res.text();
    const body = (text ? JSON.parse(text) : undefined) as T;

    return { status: res.status, body, headers: res.headers };
  }

  get<T>(path: string, headers?: Record<string, string>): Promise<ApiResult<T>> {
    return this.request<T>('GET', path, { headers });
  }

  post<T>(path: string, body?: unknown, headers?: Record<string, string>): Promise<ApiResult<T>> {
    return this.request<T>('POST', path, { body, headers });
  }

  patch<T>(path: string, body?: unknown, headers?: Record<string, string>): Promise<ApiResult<T>> {
    return this.request<T>('PATCH', path, { body, headers });
  }

  put<T>(path: string, body?: unknown, headers?: Record<string, string>): Promise<ApiResult<T>> {
    return this.request<T>('PUT', path, { body, headers });
  }

  delete<T>(path: string, headers?: Record<string, string>): Promise<ApiResult<T>> {
    return this.request<T>('DELETE', path, { headers });
  }

  async uploadFile<T>(
    path: string,
    file: { filename: string; mimeType: string; content: Buffer | string },
    fields: Record<string, string> = {},
  ): Promise<ApiResult<T>> {
    const form = new FormData();
    for (const [key, value] of Object.entries(fields)) form.append(key, value);
    const blob = new Blob([file.content], { type: file.mimeType });
    form.append('file', blob, file.filename);

    const headers: Record<string, string> = {};
    const cookieHeader = this.cookieHeader(path);
    if (cookieHeader) headers.cookie = cookieHeader;

    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers,
      body: form,
    });

    this.captureCookies(res.headers);

    const text = await res.text();
    const body = (text ? JSON.parse(text) : undefined) as T;

    return { status: res.status, body, headers: res.headers };
  }
}

export interface ApiErrorBody {
  message: string;
  code?: string;
  error?: string;
  statusCode?: number;
}
