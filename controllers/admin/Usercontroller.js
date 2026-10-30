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
    // Agar pehle koi filter/search tha to wo yahan rakho, warna khali rehne do
    const filter = {};

    // 👈 pagination hata diya: skip, limit, page, countDocuments sab remove
    const users = await User.find(filter).sort({ createdAt: -1 });

    res.render("users", {
      title: "Manage Users",
      users,
      filters: req.query,
      pagination: null,   // 👈 EJS me pagination block apne aap hide ho jayega
      adminName: req.session.admin?.name || "Admin",
      url: req.originalUrl,
      messages: req.flash(),
    });
  } catch (err) {
    console.error("listUsers error:", err);
    req.flash("error", "Failed to load users.");
    res.redirect("/admin/dashboard");
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

const USER_LIST_URL = "/admin/user/users";

const parseUserBody = (body) => {
  const toNum = (v) => (v !== undefined && v !== "" ? Number(v) : undefined);

  return {
    name: (body.name || "").trim(),
    countryCode: (body.countryCode || "+91").trim(),
    phone: (body.phone || "").trim(),
    email: (body.email || "").trim().toLowerCase(),
    status: body.status === "blocked" ? "blocked" : "active",
    isPhoneVerified: body.isPhoneVerified === "on",
    isProfileComplete: body.isProfileComplete === "on",

    dateOfBirth: body.dateOfBirth || undefined,
    birthTime: (body.birthTime || "").trim(),
    birthPlace: (body.birthPlace || "").trim(),

    lastPeriodDate: body.lastPeriodDate || undefined,
    averageCycleLength: toNum(body.averageCycleLength),
    averagePeriodLength: toNum(body.averagePeriodLength),
  };
};

const validateUserData = (data) => {
  if (!data.name) return "Name is required.";
  if (!/^\d{10}$/.test(data.phone)) return "Phone number must be 10 digits.";
  if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) return "Enter a valid email.";
  if (data.averageCycleLength && (data.averageCycleLength < 15 || data.averageCycleLength > 60))
    return "Average cycle length should be between 15 and 60 days.";
  if (data.averagePeriodLength && (data.averagePeriodLength < 1 || data.averagePeriodLength > 15))
    return "Average period length should be between 1 and 15 days.";
  return null;
};

/* ---------------------------- ADD ---------------------------- */
exports.newUserForm = (req, res) => {
  res.render("user_form", {
    title: "Add User",
    user: null,
    adminName: req.session.admin?.name || "Admin",
    url: req.originalUrl,
    messages: req.flash(),
  });
};

exports.createUser = async (req, res) => {
  const addUrl = `${USER_LIST_URL}/create`;
  try {
    const data = parseUserBody(req.body);

    const errMsg = validateUserData(data);
    if (errMsg) {
      req.flash("error", errMsg);
      return res.redirect(addUrl);
    }

    const dup = await User.findOne({
      $or: [
        { countryCode: data.countryCode, phone: data.phone },
        ...(data.email ? [{ email: data.email }] : []),
      ],
    });
    if (dup) {
      req.flash("error", "A user with this phone number or email already exists.");
      return res.redirect(addUrl);
    }

    await User.create({
      name: data.name,
      countryCode: data.countryCode,
      phone: data.phone,
      email: data.email || undefined,
      status: data.status,
      isPhoneVerified: data.isPhoneVerified,
      isProfileComplete: data.isProfileComplete,
      birthInfo: {
        dateOfBirth: data.dateOfBirth,
        birthTime: data.birthTime,
        birthPlace: data.birthPlace,
      },
      cycleInfo: {
        lastPeriodDate: data.lastPeriodDate,
        averageCycleLength: data.averageCycleLength,
        averagePeriodLength: data.averagePeriodLength,
      },
    });

    req.flash("success", "User added successfully!");
    res.redirect(USER_LIST_URL);
  } catch (err) {
    console.error("createUser error:", err);
    req.flash("error", err.code === 11000 ? "Phone or email already exists." : err.message || "Failed to add user.");
    res.redirect(addUrl);
  }
};

/* ---------------------------- EDIT ---------------------------- */
exports.editUserForm = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      req.flash("error", "User not found.");
      return res.redirect(USER_LIST_URL);
    }
    res.render("user_form", {
      title: "Edit User",
      user,
      adminName: req.session.admin?.name || "Admin",
      url: req.originalUrl,
      messages: req.flash(),
    });
  } catch (err) {
    console.error("editUserForm error:", err);
    req.flash("error", "Failed to load user.");
    res.redirect(USER_LIST_URL);
  }
};

exports.updateUser = async (req, res) => {
  const editUrl = `${USER_LIST_URL}/${req.params.id}/edit`;
  try {
    const data = parseUserBody(req.body);

    const errMsg = validateUserData(data);
    if (errMsg) {
      req.flash("error", errMsg);
      return res.redirect(editUrl);
    }

    const dup = await User.findOne({
      _id: { $ne: req.params.id },
      $or: [
        { countryCode: data.countryCode, phone: data.phone },
        ...(data.email ? [{ email: data.email }] : []),
      ],
    });
    if (dup) {
      req.flash("error", "Another user already uses this phone number or email.");
      return res.redirect(editUrl);
    }

    // dot-notation: sirf yehi fields badlenge, MPIN / birthChart wagairah safe rahenge
    const update = {
      name: data.name,
      countryCode: data.countryCode,
      phone: data.phone,
      email: data.email || undefined,
      status: data.status,
      isPhoneVerified: data.isPhoneVerified,
      isProfileComplete: data.isProfileComplete,
      "birthInfo.birthTime": data.birthTime,
      "birthInfo.birthPlace": data.birthPlace,
    };
    if (data.dateOfBirth) update["birthInfo.dateOfBirth"] = data.dateOfBirth;
    if (data.lastPeriodDate) update["cycleInfo.lastPeriodDate"] = data.lastPeriodDate;
    if (data.averageCycleLength) update["cycleInfo.averageCycleLength"] = data.averageCycleLength;
    if (data.averagePeriodLength) update["cycleInfo.averagePeriodLength"] = data.averagePeriodLength;

    const updated = await User.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
    if (!updated) {
      req.flash("error", "User not found.");
      return res.redirect(USER_LIST_URL);
    }

    req.flash("success", "User updated successfully!");
    res.redirect(`${USER_LIST_URL}/${req.params.id}`); // user detail page par wapas
  } catch (err) {
    console.error("updateUser error:", err);
    req.flash("error", err.code === 11000 ? "Phone or email already exists." : err.message || "Failed to update user.");
    res.redirect(editUrl);
  }
};