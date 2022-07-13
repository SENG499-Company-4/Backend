import fetch from 'node-fetch';

export const usePost = async <T, R>(url: string, body: T): Promise<R> => {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  console.log(res);
  if (!res.ok) throw new Error('fail');

  return res.json();
};
