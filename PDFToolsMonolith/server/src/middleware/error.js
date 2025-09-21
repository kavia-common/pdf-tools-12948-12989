export function notFoundHandler(req, res, _next) {
  res.status(404).json({ error: 'Not Found' });
}

export function errorHandler(err, req, res, _next) {
  // eslint-disable-next-line no-console
  console.error('Unhandled error', err);
  res.status(500).json({ error: 'Internal Server Error' });
}
