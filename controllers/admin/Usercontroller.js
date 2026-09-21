const User = require("../../models/User");

/* ------------------------------------------------------------------ */
/*  LIST USERS -> GET /admin/users                                     */
/*  Shows every registered user with quick-glance status               */
/* ------------------------------------------------------------------ */
// List Users
// exports.listUsers = async (req, res) => {
//   try {
//     const users = await User.find({}).sort({ createdAt: -1 }); // apna logic yahan daal do

//     res.render("users", {   // ← Agar file yahan hai to
//       title: "Users Management",        // ← Yeh line zaroori hai
//       users: users,
//       search: req.query.search || "",
//       url: req.originalUrl,
//       messages: req.flash()
//     });

//   } catch (err) {
//     console.error(err);
//     req.flash("error", "Failed to load users.");
//     res.redirect("/admin/login");
//   }
// };

exports.listUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const { search = '', status = '', verified = '' } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.status = status; // 'active' | 'blocked'
    }

    if (verified === 'yes') {
      query.isPhoneVerified = true;
    } else if (verified === 'no') {
      query.isPhoneVerified = false;
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.render('users', {
      title: 'Users',
      url: req.originalUrl,          // <-- needed by sidenavbar.ejs
      users,
      filters: { search, status, verified },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      messages: req.flash ? req.flash() : {}
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load users');
    res.redirect('/admin/dashboard');
  }
};

/* ------------------------------------------------------------------ */
/*  VIEW USER DETAILS -> GET /admin/users/:id                          */
/*  Shows EVERYTHING the user filled: profile, birth info, cycle info, */
/*  personalization, verification status, etc.                         */
/* ------------------------------------------------------------------ */
exports.viewUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) return res.redirect("/admin/users");

  res.render("user_view",
    {
      user,
      adminName: req.session.adminName,
      title: "user-view",
      url: req.originalUrl,
      messages: req.flash()
    }
  );
};

/* ------------------------------------------------------------------ */
/*  BLOCK / UNBLOCK USER -> POST /admin/users/:id/status               */
/* ------------------------------------------------------------------ */
exports.updateUserStatus = async (req, res) => {
  const { status } = req.body; // "active" | "blocked"

  await User.findByIdAndUpdate(req.params.id, { status });

  res.redirect(`/admin/users/${req.params.id}`);
};