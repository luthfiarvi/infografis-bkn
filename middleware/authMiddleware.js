function ensureAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    req.user = req.session.user;
    res.locals.currentUser = req.session.user;
    return next();
  }

  // If this is an API call, return 401 JSON
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(401).json({
      success: false,
      message: 'Sesi berakhir atau Anda belum login. Silakan login terlebih dahulu.'
    });
  }

  // Store return url
  req.session.returnTo = req.originalUrl;
  return res.redirect('/login?error=Silakan+login+terlebih+dahulu');
}

function redirectIfAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return res.redirect('/generator');
  }
  next();
}

module.exports = {
  ensureAuthenticated,
  redirectIfAuthenticated
};
