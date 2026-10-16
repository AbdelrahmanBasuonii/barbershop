export async function api(path, options = {}) {
  const { body, token, ...requestOptions } = options;
  const authToken = token === undefined ? localStorage.getItem('t') || localStorage.getItem('at') : token;
  const headers = new Headers(requestOptions.headers || {});
  if (authToken) headers.set('Authorization', `Bearer ${authToken}`);
  if (body && !(body instanceof FormData)) headers.set('Content-Type', 'application/json');

  const response = await fetch(path.startsWith('/api/') ? path : `/api/${path}`, {
    ...requestOptions,
    headers,
    body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body)
  });
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(data?.error || `فشل الطلب (${response.status})`);
  return data;
}

export const bookingStatuses = {
  pending: 'بانتظار التأكيد',
  confirmed: 'مؤكد',
  done: 'تم',
  cancelled: 'ملغي'
};

export const daysOfWeek = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
