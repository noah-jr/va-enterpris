const API_BASE_URL = '/api/v1';

export class ApiRequestError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

interface ErrorEnvelope {
  message?: string;
  error?: { message?: string };
}

const extractErrorMessage = async (response: Response, fallback: string): Promise<string> => {
  try {
    const body = (await response.json()) as ErrorEnvelope;
    return body.error?.message ?? body.message ?? fallback;
  } catch {
    return fallback;
  }
};

export const apiGet = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new ApiRequestError(
      await extractErrorMessage(response, 'Não foi possível carregar os dados.'),
      response.status,
    );
  }

  return response.json() as Promise<T>;
};

export const apiPost = async <T>(path: string, payload: unknown): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new ApiRequestError(
      await extractErrorMessage(response, 'Ocorreu um erro ao processar o pedido.'),
      response.status,
    );
  }

  return response.json() as Promise<T>;
};
