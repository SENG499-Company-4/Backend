import fetch from 'node-fetch';

export const usePost = async <T, R>(url: string, body: T): Promise<R> => {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (res.status === 400) throw new Error((await res.json()).detail ?? 'Unable to generate schedule');

  return res.json();
};
