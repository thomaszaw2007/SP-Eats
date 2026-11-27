const { createHash, timingSafeEqual } = require('node:crypto');

function digest(value) {
  return createHash('sha256').update(value).digest();
}

module.exports = function requireAdmin(req, res, next) {
  res.set('Cache-Control', 'no-store');

  const expected = process.env.ADMIN_ACCESS_TOKEN;
  if (!expected || expected.length < 32) {
    return res.status(503).json({ error: 'Review moderation is unavailable.' });
  }

  const match = /^Bearer ([^\s]+)$/i.exec(req.get('Authorization') || '');
  if (!match || !timingSafeEqual(digest(match[1]), digest(expected))) {
    return res.status(401).json({ error: 'A valid moderator key is required.' });
  }

  next();
};
