const bcrypt = require("bcryptjs");
const Admin = require("../../models/admin");

/* ===================== GET LOGIN PAGE ===================== */
exports.getLoginPage = (req, res) => {
  res.render("login", {
    title: "Admin Login",
    error: null,
  });
};

/* ===================== POST LOGIN ===================== */
exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render("login", {
        title: "Admin Login",
        error: "Email and password are required.",
      });
    }

    const admin = await Admin.findOne({ email }).select("+password");

    if (!admin) {
      return res.render("login", {
        title: "Admin Login",
        error: "Invalid email or password.",
      });
    }

    if (!admin.isActive) {
      return res.render("login", {
        title: "Admin Login",
        error: "Your account has been deactivated. Contact the Super Admin.",
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.render("login", {
        title: "Admin Login",
        error: "Invalid email or password.",
      });
    }

    req.session.admin = {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role, // S = Super Admin, A = Sub Admin
      isLoggedIn: true,
    };

    req.session.save((err) => {
      if (err) console.error("Session Save Error:", err);
      res.redirect("/admin/dashboard");
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.render("login", {
      title: "Admin Login",
      error: "Something went wrong. Please try again.",
    });
  }
};

/* ===================== LOGOUT ===================== */
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error("Logout Error:", err);
    res.clearCookie("connect.sid"); // important
    res.redirect("/admin/login");
  });
};

/* ===================== DASHBOARD ===================== */
const User = require("../../models/User");
const UserSubscription = require("../../models/UserSubscription");
const TarotDraw = require("../../models/TarotDraw");
const MoonPhaseInfo = require("../../models/MoonPhaseInfo");
const { calculateMoonPhase } = require("../../utils/Astrologyservice");
const moment = require("moment-timezone");
const RitualCompletion = require("../../models/RitualCompletion");
const SavedItem = require("../../models/SavedItem");

const DASHBOARD_TZ = "Asia/Kolkata";


/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */
const startOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const ZODIAC_EMOJI = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋",
  Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏",
  Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
};

/* Ek din me jin users ne koi bhi activity ki, unki unique list */
const getActiveUserIds = async (start, end) => {
  const [tarot, ritual, saved, newUsers] = await Promise.all([
    TarotDraw.distinct("user", { date: { $gte: start, $lt: end } }),
    RitualCompletion.distinct("user", { date: { $gte: start, $lt: end } }),
    SavedItem.distinct("user", { createdAt: { $gte: start, $lt: end } }),
    // us din signup karne wale user bhi active maane gaye (unhone app use kiya)
    User.distinct("_id", { createdAt: { $gte: start, $lt: end } }),
  ]);

  // duplicate hatao (same user ne tarot + ritual dono kiya ho to 1 hi count ho)
  const unique = new Set(
    [...tarot, ...ritual, ...saved, ...newUsers].map((id) => id.toString())
  );
  return unique.size;
};

/* Last 7 din ke signups + active users */
const buildWeeklyTrend = async () => {
  const labels = [];
  const jobs = [];

  for (let i = 6; i >= 0; i--) {
    const start = startOfDay(addDays(new Date(), -i));
    const end = addDays(start, 1);

    labels.push(
      start.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" })
    );

    jobs.push(
      Promise.all([
        User.countDocuments({ createdAt: { $gte: start, $lt: end } }),
        getActiveUserIds(start, end),
      ])
    );
  }

  const results = await Promise.all(jobs);

  return {
    labels,
    data: results.map(([signups]) => signups),
    activeData: results.map(([, active]) => active),
  };
};
const buildZodiacStats = async () => {
  const rows = await User.aggregate([
    {
      $addFields: {
        zodiacSign: {
          $ifNull: [
            "$birthChart.ascendant.sign",
            { $ifNull: ["$birthChart.sun.sign", "$birthChart.sunSign"] },
          ],
        },
      },
    },
    { $match: { zodiacSign: { $type: "string", $ne: "" } } },
    { $group: { _id: "$zodiacSign", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]); // 👈 $limit yahan se hata diya, taaki total sahi nikle

  const total = rows.reduce((sum, r) => sum + r.count, 0); // saare chart wale users

  return rows.slice(0, 6).map((r) => ({
    sign: r._id,
    emoji: ZODIAC_EMOJI[r._id] || "✨",
    count: r.count,
    percent: total ? Math.round((r.count / total) * 100) : 0,
  }));
};

// exports.getDashboard = async (req, res) => {
//   try {
//     // Cache disable – flash / query messages ke liye
//     res.set({
//       "Cache-Control": "no-store, no-cache, must-revalidate, private",
//       Pragma: "no-cache",
//       Expires: "0",
//     });

//     // ---- MESSAGES (flash + query string) ----
//     let messages = {};
//     try {
//       const flashMsgs = typeof req.flash === "function" ? req.flash() : {};
//       if (flashMsgs && typeof flashMsgs === "object") {
//         messages = { ...flashMsgs };
//       }
//     } catch (e) {
//       // flash fail ho to ignore
//     }

//     // Arrays ensure karo
//     if (messages.error && !Array.isArray(messages.error)) {
//       messages.error = [messages.error];
//     }
//     if (messages.success && !Array.isArray(messages.success)) {
//       messages.success = [messages.success];
//     }

//     // Query string se error / success (permission deny yahan se aata hai)
//     if (req.query.error) {
//       if (!messages.error) messages.error = [];
//       messages.error.push(String(req.query.error));
//     }
//     if (req.query.success) {
//       if (!messages.success) messages.success = [];
//       messages.success.push(String(req.query.success));
//     }

//     console.log(">>> DASHBOARD MESSAGES =", JSON.stringify(messages));

//     const todayStart = moment().tz(DASHBOARD_TZ).startOf("day").toDate();
//     const todayEnd = moment().tz(DASHBOARD_TZ).endOf("day").toDate();
//     const sevenDaysAgo = moment()
//       .tz(DASHBOARD_TZ)
//       .startOf("day")
//       .subtract(6, "days")
//       .toDate();

//     const [
//       totalUsers,
//       newSignupsToday,
//       activeSubscribers,
//       tarotDrawsToday,
//       zodiacAggregation,
//       weeklySignupsAggregation,
//     ] = await Promise.all([
//       User.countDocuments({
//         isPhoneVerified: true,
//         status: { $ne: "deleted" },
//       }),

//       User.countDocuments({
//         isPhoneVerified: true,
//         createdAt: { $gte: todayStart, $lt: todayEnd },
//       }),

//       UserSubscription.countDocuments({ status: "active" }),

//       TarotDraw.countDocuments({
//         date: { $gte: todayStart, $lt: todayEnd },
//       }),

//       User.aggregate([
//         { $match: { "birthChart.sunSign": { $ne: null } } },
//         { $group: { _id: "$birthChart.sunSign", count: { $sum: 1 } } },
//         { $sort: { count: -1 } },
//         { $limit: 4 },
//       ]),

//       User.aggregate([
//         {
//           $match: {
//             isPhoneVerified: true,
//             createdAt: { $gte: sevenDaysAgo, $lt: todayEnd },
//           },
//         },
//         {
//           $group: {
//             _id: {
//               $dateToString: {
//                 format: "%Y-%m-%d",
//                 date: "$createdAt",
//                 timezone: DASHBOARD_TZ,
//               },
//             },
//             count: { $sum: 1 },
//           },
//         },
//       ]),
//     ]);

//     const moonPhase = calculateMoonPhase(new Date(), DASHBOARD_TZ);
//     const moonContent = await MoonPhaseInfo.findOne({
//       phaseName: moonPhase.phaseName,
//     });

//     const zodiacTotal = zodiacAggregation.reduce((sum, z) => sum + z.count, 0);
//     const zodiacSigns = zodiacAggregation.map((z) => ({
//       sign: z._id,
//       emoji: ZODIAC_EMOJI[z._id] || "✨",
//       percent: zodiacTotal > 0 ? Math.round((z.count / zodiacTotal) * 100) : 0,
//     }));

//     const countByDate = {};
//     weeklySignupsAggregation.forEach((row) => {
//       countByDate[row._id] = row.count;
//     });

//     const weeklyLabels = [];
//     const weeklyData = [];
//     for (let i = 6; i >= 0; i--) {
//       const d = moment().tz(DASHBOARD_TZ).startOf("day").subtract(i, "days");
//       const key = d.format("YYYY-MM-DD");
//       weeklyLabels.push(d.format("ddd"));
//       weeklyData.push(countByDate[key] || 0);
//     }

//     res.render("index", {
//       title: "Dashboard",
//       adminName: req.session.admin?.name || "Admin",
//       url: "/admin",
//       messages,
//       stats: {
//         totalUsers,
//         newSignupsToday,
//         activeSubscribers,
//         tarotDrawsToday,
//       },
//       moon: {
//         phaseName: moonPhase.phaseName,
//         currentSign: moonPhase.currentSign,
//         illuminationPercent: moonPhase.illuminationPercent,
//         description: moonContent?.description || "",
//       },
//       zodiacSigns,
//       weeklyTrend: {
//         labels: weeklyLabels,
//         data: weeklyData,
//       },
//     });
//   } catch (err) {
//     console.error("Dashboard Error:", err);

//     const messages = {};
//     if (req.query.error) {
//       messages.error = [String(req.query.error)];
//     }
//     if (req.query.success) {
//       messages.success = [String(req.query.success)];
//     }

//     res.render("index", {
//       title: "Dashboard",
//       adminName: req.session.admin?.name || "Admin",
//       url: "/admin",
//       messages,
//       stats: {
//         totalUsers: 0,
//         newSignupsToday: 0,
//         activeSubscribers: 0,
//         tarotDrawsToday: 0,
//       },
//       moon: {
//         phaseName: "-",
//         currentSign: "-",
//         illuminationPercent: 0,
//         description: "",
//       },
//       zodiacSigns: [],
//       weeklyTrend: { labels: [], data: [] },
//     });
//   }
// };
/* ------------------------------------------------------------------ */
/* GET /admin  (Dashboard)                                            */
/* ------------------------------------------------------------------ */
exports.getDashboard = async (req, res) => {
  try {
    const todayStart = startOfDay();
    const todayEnd = addDays(todayStart, 1);

    // ---------------- Moon (today) ----------------
    const moonCalc = calculateMoonPhase(new Date(), "Asia/Kolkata");
    const moonContent = await MoonPhaseInfo.findOne({
      phaseName: moonCalc.phaseName,
    });

    const moon = {
      phaseName: moonCalc.phaseName,
      currentSign: moonCalc.currentSign || moonCalc.sign || null,   // 👈 calculateMoonPhase jo key return kare
      illuminationPercent: moonCalc.illuminationPercent ?? null,
      description: moonContent?.description || "",
    };

    // ---------------- Stats + charts (parallel) ----------------
    const [
      newSignupsToday,
      activeSubscribers,
      tarotDrawsToday,
      totalUsers,
      zodiacSigns,
      weeklyTrend,
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: todayStart, $lt: todayEnd } }),

      // 👈 Subscription ka apna logic lagao (neeche note dekho)
      User.countDocuments({ "subscription.status": "active" }),

      TarotDraw.countDocuments({ date: { $gte: todayStart, $lt: todayEnd } }),

      User.countDocuments({}),

      buildZodiacStats(),
      buildWeeklyTrend(),
    ]);

    res.render("index", {
      title: "Dashboard",
      adminName: req.session.admin?.name || "Admin",
      url: req.originalUrl,
      messages: req.flash(),

      stats: {
        newSignupsToday,
        activeSubscribers,
        tarotDrawsToday,
        totalUsers,
      },
      moon,
      zodiacSigns,
      weeklyTrend,   // { labels, data (signups), activeData }
    });
  } catch (err) {
    console.error("getDashboard error:", err);

    // Error me bhi page khule, crash na ho
    res.render("index", {
      title: "Dashboard",
      adminName: req.session.admin?.name || "Admin",
      url: req.originalUrl,
      messages: { error: ["Failed to load dashboard data."] },
      stats: { newSignupsToday: 0, activeSubscribers: 0, tarotDrawsToday: 0, totalUsers: 0 },
      moon: { phaseName: "-", currentSign: null, illuminationPercent: null, description: "" },
      zodiacSigns: [],
      weeklyTrend: { labels: [], data: [], activeData: [] },
    });
  }
};
/* ===================== CHANGE PASSWORD ===================== */
exports.getChangePass = (req, res) => {
  const messages = {};

  if (req.query.error) messages.error = [req.query.error];
  if (req.query.success) messages.success = [req.query.success];

  res.render("change_pass", {
    title: "Change Password",
    url: req.originalUrl,
    messages,
  });
};

exports.postChangePass = async (req, res) => {
  try {
    const { currentpass, newpass, cfnewpass } = req.body;

    if (!currentpass || !newpass || !cfnewpass) {
      return res.redirect("/admin/changepass?error=All fields are required");
    }

    if (newpass.length < 8) {
      return res.redirect("/admin/changepass?error=New password must be at least 8 characters long");
    }

    if (newpass === currentpass) {
      return res.redirect("/admin/changepass?error=New password cannot be same as current password");
    }

    if (newpass !== cfnewpass) {
      return res.redirect("/admin/changepass?error=New password and confirm password do not match");
    }

    if (!req.session.admin?.id) {
      return res.redirect("/admin/login");
    }

    const admin = await Admin.findById(req.session.admin.id).select("+password");

    if (!admin) {
      return res.redirect("/admin/changepass?error=Admin not found");
    }

    const isMatch = await admin.comparePassword(currentpass);
    if (!isMatch) {
      return res.redirect("/admin/changepass?error=Current password is incorrect");
    }

    admin.password = newpass; // pre-save hook hashes this automatically
    await admin.save();

    return res.redirect("/admin/logout?success=Password changed successfully");
  } catch (error) {
    console.error("Change Password Error:", error);
    return res.redirect("/admin/changepass?error=Something went wrong. Please try again.");
  }
};

/* ============================================
   SUB ADMIN ROUTES (Only Super Admin Access)
   ============================================ */

// Permission modules matched to this project's actual sidenav sections
// (see _layouts/sidenavbar.ejs) — NOT the courier/delivery modules from
// the other project. Update this list if the sidenav changes.
const SUBADMIN_MODULES = [
  
  { key: "users", name: "Users" },
  { key: "cms", name: "CMS Pages" },
  { key: "content", name: "Content Management" },
  { key: "readings", name: "Reading Management" },
  { key: "rhythm", name: "Rhythm Content" },
  { key: "subscription", name: "Subscription" },
  { key: "subadmin", name: "Sub Admin Management" }, 
  // { key: "notifications", name: "Notifications" },
];

// Get Sub Admin List
exports.getSubAdminList = async (req, res) => {
  try {
    const subadmins = await Admin.find({ role: "A" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.render("subadmin_list", {
      subadmins,
      admin: req.admin,
      title: "sub-admin",
      url: req.originalUrl,
      messages: req.flash(),
    });
  } catch (error) {
    console.error("Get Sub Admin List Error:", error);
    req.flash("error", "Error fetching sub admins");
    res.redirect("/admin/dashboard");
  }
};

// Render Add Sub Admin Form
exports.getAddSubAdmin = async (req, res) => {
  try {
    const modules = SUBADMIN_MODULES;

    res.render("subadmin_add", {
      modules,
      admin: req.admin,
      title: "Add Sub Admin",
      url: req.originalUrl,
      messages: req.flash(),
    });
  } catch (error) {
    console.error("Get Add Sub Admin Error:", error);
    req.flash("error", "Error loading form");
    res.redirect("/admin/sub-admin/list");
  }
};

// Create Sub Admin
exports.postSubAdmin = async (req, res) => {
  try {
    const { name, email, phone, password, department, employeeId, permissions } = req.body;

    if (!name || !email || !password || !phone) {
      req.flash("error", "Name, Email, Phone and Password are required!");
      return res.redirect("/admin/sub-admin/add");
    }

    const isExists = await Admin.findOne({ $or: [{ email: email.trim().toLowerCase() }, { phone }] });
    if (isExists) {
      req.flash("error", "This email or phone number is already registered!");
      return res.redirect("/admin/sub-admin/add");
    }

    let formattedPermissions = [];
    if (permissions && typeof permissions === "object") {
      formattedPermissions = Object.keys(permissions).map((key) => {
        const p = permissions[key];
        return {
          key,
          module: p.moduleName,
          isView: p.isView === "true",
          isAdd: p.isAdd === "true",
          isEdit: p.isEdit === "true",
          isDelete: p.isDelete === "true",
        };
      });
    }

    const newAdmin = await Admin.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone,
      password,
      department: department || "General",
      employeeId: employeeId || `EMP-${Date.now()}`,
      role: "A",
      permission: formattedPermissions,
      isActive: true,
    });

    console.log("Sub Admin Created Successfully:", newAdmin.email);
    req.flash("success", "Sub Admin added successfully!");
    res.redirect("/admin/sub-admin/list");
  } catch (error) {
    console.error("Create Sub Admin Error:", error);
    req.flash("error", error.message || "Failed to create sub admin");
    res.redirect("/admin/sub-admin/add");
  }
};

// Render Edit Sub Admin Form
exports.getEditSubAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);

    if (!admin || admin.role === "S") {
      req.flash("error", "Sub Admin not found!");
      return res.redirect("/admin/sub-admin/list");
    }

    const modules = SUBADMIN_MODULES;

    res.render("subadmin_edit", {
      admin: admin,
      modules,
      title: "Edit Sub Admin",
      url: req.originalUrl,
      currentAdmin: req.admin,
      messages: req.flash(),
    });
  } catch (error) {
    console.error("Get Edit Sub Admin Error:", error);
    req.flash("error", "Error loading sub admin");
    res.redirect("/admin/sub-admin/list");
  }
};

// Update Sub Admin
exports.postEditSubAdmin = async (req, res) => {
  try {
    const { name, email, phone, password, department, employeeId, permissions } = req.body;

    const admin = await Admin.findById(req.params.id);

    if (!admin || admin.role === "S") {
      req.flash("error", "Sub Admin not found!");
      return res.redirect("/admin/sub-admin/list");
    }

    const formattedPermissions = Object.values(permissions || {}).map((perm) => ({
      key: perm.module,
      module: perm.moduleName,
      isView: perm.isView === "true" || perm.isView === true,
      isAdd: perm.isAdd === "true" || perm.isAdd === true,
      isEdit: perm.isEdit === "true" || perm.isEdit === true,
      isDelete: perm.isDelete === "true" || perm.isDelete === true,
    }));

    admin.name = name;
    admin.email = email;
    if (phone) admin.phone = phone;
    admin.department = department || admin.department;
    admin.employeeId = employeeId || admin.employeeId;

    if (password && password.trim() !== "") {
      admin.password = password; // pre-save hook re-hashes
    }

    admin.permission = formattedPermissions;

    await admin.save();

    req.flash("success", "Sub Admin updated successfully.");
    res.redirect("/admin/sub-admin/list");
  } catch (error) {
    console.error("Update Sub Admin Error:", error);
    req.flash("error", error.message || "Something went wrong!");
    res.redirect("/admin/sub-admin/list");
  }
};

// Activate / Deactivate Sub Admin (matches the GET link used in subadmin_list.ejs)
exports.changeAdminStatus = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);

    if (!admin) {
      req.flash("error", "Sub Admin not found!");
      return res.redirect("/admin/sub-admin/list");
    }

    if (admin.role === "S") {
      req.flash("error", "Cannot change Super Admin status!");
      return res.redirect("/admin/sub-admin/list");
    }

    admin.isActive = req.params.status === "true";
    await admin.save();

    req.flash("success", `Sub Admin ${admin.isActive ? "activated" : "deactivated"} successfully.`);
    res.redirect("/admin/sub-admin/list");
  } catch (error) {
    console.error("Change Status Error:", error);
    req.flash("error", error.message || "Something went wrong");
    res.redirect("/admin/sub-admin/list");
  }
};

// Delete Sub Admin
exports.deleteSubAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      req.flash("error", "Sub Admin not found!");
      return res.redirect("/admin/sub-admin/list");
    }

    if (admin.role === "S") {
      req.flash("error", "Cannot delete Super Admin!");
      return res.redirect("/admin/sub-admin/list");
    }

    await Admin.findByIdAndDelete(req.params.id);

    req.flash("success", "Sub Admin deleted successfully!");
    res.redirect("/admin/sub-admin/list");
  } catch (error) {
    console.error("Delete Sub Admin Error:", error);
    req.flash("error", "Failed to delete sub admin");
    res.redirect("/admin/sub-admin/list");
  }
};