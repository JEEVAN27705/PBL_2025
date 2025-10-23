export function authorize(allowed = []) {
  const set = new Set(allowed);
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (!set.has(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}
