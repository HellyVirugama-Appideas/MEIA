// const requireAdminAuth = (req, res, next) => {
//     if (req.session && req.session.admin && req.session.admin.isLoggedIn) {
//         return next();
//     }
//     res.redirect('/admin/login');
// };

// const redirectIfLoggedIn = (req, res, next) => {
//     if (req.session && req.session.admin && req.session.admin.isLoggedIn === true) {
//         return res.redirect('/admin/dashboard');
//     }
//     next();
// };

// // Super Admin only middleware
// const isSuperAdmin = (req, res, next) => {
//   console.log('[isSuperAdmin] Full req.admin:', req.admin);

//   if (!req.admin) {
//     console.log('[isSuperAdmin] req.admin is missing');
//     req.flash('red', 'Session expired. Please login again.');
//     return res.redirect('/admin/signin');
//   }

//   const role = req.admin.role;

//   console.log('[isSuperAdmin] Role value:', role);

//   if (role !== 'S') {
//     console.log('[isSuperAdmin] Not superadmin. Role was:', role);
//     req.flash('red', 'Super Admin access required');
//     return res.redirect('/admin/dashboard');
//   }

//   console.log('[isSuperAdmin] Super Admin access granted');
//   next();
// };
// module.exports = {
//     requireAdminAuth,
//     redirectIfLoggedIn,
//     isSuperAdmin
// };

const Admin = require("../models/admin");

/**
 * Requires an active, logged-in admin session.
 * Fetches a fresh copy of the admin from the DB and attaches it to req.admin,
 * so downstream middleware (like isSuperAdmin) always has an up-to-date role/isActive.
 */
const requireAdminAuth = async (req, res, next) => {
  // Flash / dynamic pages ke liye cache disable
  res.set({
    "Cache-Control": "no-store, no-cache, must-revalidate, private",
    Pragma: "no-cache",
    Expires: "0",
  });

  if (!(req.session && req.session.admin && req.session.admin.isLoggedIn)) {
    return res.redirect("/admin/login");
  }

  try {
    const admin = await Admin.findById(req.session.admin.id).select("-password");

    if (!admin || !admin.isActive) {
      req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.redirect("/admin/login");
      });
      return;
    }

    req.admin = admin;
    return next();
  } catch (err) {
    console.error("requireAdminAuth Error:", err);
    return res.redirect("/admin/login");
  }
};
/**
 * Prevents an already-logged-in admin from re-visiting the login page.
 */
const redirectIfLoggedIn = (req, res, next) => {
    if (req.session && req.session.admin && req.session.admin.isLoggedIn === true) {
        return res.redirect("/admin/dashboard");
    }
    next();
};

/**
 * Restricts a route to Super Admin (role === 'S') only.
 * Must run AFTER requireAdminAuth, since it relies on req.admin.
 */
const isSuperAdmin = (req, res, next) => {
    if (!req.admin) {
        if (typeof req.flash === "function") req.flash("error", "Session expired. Please login again.");
        return res.redirect("/admin/login");
    }

    if (req.admin.role !== "S") {
        if (typeof req.flash === "function") req.flash("error", "Super Admin access required");
        return res.redirect("/admin/dashboard");
    }

    next();
};

const checkPermission = (moduleKey, action = "isView") => {
  return (req, res, next) => {
    if (!req.admin) {
      if (typeof req.flash === "function") {
        req.flash("error", "Session expired. Please login again.");
      }
      return res.redirect("/admin/login");
    }

    if (req.admin.role === "S") return next();

    const perm = (req.admin.permission || []).find(
      (p) => p.key === moduleKey || p.module === moduleKey
    );

    const allowed =
      perm &&
      (perm[action] === true ||
        perm[action] === "true" ||
        perm[action] === 1);

    if (!allowed) {
      // Flash + query dono — query guaranteed dikhega
      if (typeof req.flash === "function") {
        req.flash("error", "You do not have permission to access this page.");
      }
      return res.redirect(
        "/admin/dashboard?error=" +
          encodeURIComponent("You do not have permission to access this page.")
      );
    }

    next();
  };
};

module.exports = {
    requireAdminAuth,
    redirectIfLoggedIn,
    isSuperAdmin,
    checkPermission,
};