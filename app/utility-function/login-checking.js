module.exports.isLoggedInRedirect = (req, res, next) => {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/login');
    return;
}

module.exports.isLoggedInNotice = (req, res, next)=> {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.send({status: "error", information: "Login required"});
    return;
}

module.exports.isAdminRedirect = (req,res,next) =>{
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated() && req.user.local.role === "admin"){
    return next();
  }
  // if they aren't redirect them to the home page
  res.redirect('/login');
  return;
}
