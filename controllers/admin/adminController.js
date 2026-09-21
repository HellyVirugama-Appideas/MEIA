// const bcrypt = require("bcryptjs");
// const Admin = require("../../models/admin");

// /* ===================== GET LOGIN PAGE ===================== */
// exports.getLoginPage = (req, res) => {
//   res.render("login", { 
//     title: "Admin Login",
//     error: null 
//   });
// };

// /* ===================== POST LOGIN ===================== */
// exports.postLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.render("login", { 
//         title: "Admin Login",
//         error: "Email and password are required." 
//       });
//     }

//     const admin = await Admin.findOne({ email }).select("+password");

//     if (!admin) {
//       return res.render("login", { 
//         title: "Admin Login",
//         error: "Invalid email or password." 
//       });
//     }

//     const isMatch = await bcrypt.compare(password, admin.password);
//     if (!isMatch) {
//       return res.render("login", { 
//         title: "Admin Login",
//         error: "Invalid email or password." 
//       });
//     }

//     req.session.admin = {
//       id: admin._id,
//       name: admin.name,
//       email: admin.email,
//       isLoggedIn: true
//     };

//     req.session.save((err) => {
//       if (err) console.error("Session Save Error:", err);
//       res.redirect("/admin/dashboard");
//     });

//   } catch (err) {
//     console.error("Login Error:", err);
//     res.render("login", { 
//       title: "Admin Login",
//       error: "Something went wrong. Please try again." 
//     });
//   }
// };

// /* ===================== LOGOUT ===================== */
// exports.logout = (req, res) => {
//   req.session.destroy((err) => {
//     if (err) console.error("Logout Error:", err);
//     res.clearCookie('connect.sid');   // Important
//     res.redirect("/admin/login");
//   });
// };

// /* ===================== DASHBOARD ===================== */
// const User = require("../../models/User");
// const UserSubscription = require("../../models/UserSubscription");
// const TarotDraw = require("../../models/TarotDraw");
// const MoonPhaseInfo = require("../../models/MoonPhaseInfo");
// const { calculateMoonPhase } = require("../../utils/Astrologyservice");
// const moment = require("moment-timezone");

// const DASHBOARD_TZ = "Asia/Kolkata";

// const ZODIAC_EMOJI = {
//   Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋",
//   Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏",
//   Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
// };

// exports.getDashboard = async (req, res) => {
//   try {
//     // NOTE: date boundaries are computed in IST (not server-local time),
//     // same timezone the rest of the app (moon phase calc, etc) uses -
//     // avoids "today" silently meaning a different day than what an
//     // India-based admin/user actually experiences as today.
//     const todayStart = moment().tz(DASHBOARD_TZ).startOf("day").toDate();
//     const todayEnd = moment().tz(DASHBOARD_TZ).endOf("day").toDate();
//     const sevenDaysAgo = moment().tz(DASHBOARD_TZ).startOf("day").subtract(6, "days").toDate(); // includes today = 7 days total

//     // "Signed up" = completed phone verification (POST /api/auth/verify-otp
//     // with purpose=signup). Using isGuest:false here was the bug - that
//     // flag only flips once MPIN is ALSO set (setMpin), so a user who
//     // verified OTP but hasn't set an MPIN yet was being silently excluded
//     // from every count below, even on the day they actually signed up.
//     const [
//       totalUsers,
//       newSignupsToday,
//       activeSubscribers,
//       tarotDrawsToday,
//       zodiacAggregation,
//       weeklySignupsAggregation,
//     ] = await Promise.all([
//       User.countDocuments({ isPhoneVerified: true, status: { $ne: "deleted" } }),

//       User.countDocuments({
//         isPhoneVerified: true,
//         createdAt: { $gte: todayStart, $lt: todayEnd },
//       }),

//       UserSubscription.countDocuments({ status: "active" }),

//       TarotDraw.countDocuments({
//         date: { $gte: todayStart, $lt: todayEnd },
//       }),

//       // Most common Sun Signs across users who have a calculated birth chart
//       User.aggregate([
//         { $match: { "birthChart.sunSign": { $ne: null } } },
//         { $group: { _id: "$birthChart.sunSign", count: { $sum: 1 } } },
//         { $sort: { count: -1 } },
//         { $limit: 4 },
//       ]),

//       // Daily new-signup counts for the last 7 days (for the trend chart).
//       // Grouped in IST (timezone option) so "day" boundaries match the
//       // labels built further down, instead of silently grouping by UTC day.
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

//     // ---- Today's Moon Phase (live Swiss Ephemeris calculation) ----
//     const moonPhase = calculateMoonPhase(new Date(), DASHBOARD_TZ);
//     const moonContent = await MoonPhaseInfo.findOne({ phaseName: moonPhase.phaseName });

//     // ---- Most Active Zodiac Signs -> convert counts to percentages ----
//     const zodiacTotal = zodiacAggregation.reduce((sum, z) => sum + z.count, 0);
//     const zodiacSigns = zodiacAggregation.map((z) => ({
//       sign: z._id,
//       emoji: ZODIAC_EMOJI[z._id] || "✨",
//       percent: zodiacTotal > 0 ? Math.round((z.count / zodiacTotal) * 100) : 0,
//     }));

//     // ---- Weekly signup trend -> fill in every day, even days with 0 signups ----
//     // Keys built the same way (IST "YYYY-MM-DD") as the aggregation above,
//     // so a day's count actually lines up with its label.
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
//     res.render("index", {
//       title: "Dashboard",
//       adminName: req.session.admin?.name || "Admin",
//       url: "/admin",
//       stats: { totalUsers: 0, newSignupsToday: 0, activeSubscribers: 0, tarotDrawsToday: 0 },
//       moon: { phaseName: "-", currentSign: "-", illuminationPercent: 0, description: "" },
//       zodiacSigns: [],
//       weeklyTrend: { labels: [], data: [] },
//     });
//   }
// };

// exports.getChangePass = (req, res) => {
//   const messages = {};

//   if (req.query.error) {
//     messages.error = [req.query.error];
//   }
//   if (req.query.success) {
//     messages.success = [req.query.success];
//   }

//   res.render('change_pass', {
//     title: 'Change Password',
//     url: req.originalUrl,
//     messages: messages
//   });
// };
// ``
// exports.postChangePass = async (req, res) => {
//   try {
//     const { currentpass, newpass, cfnewpass } = req.body;

//     if (!currentpass || !newpass || !cfnewpass) {
//       return res.redirect('/admin/changepass?error=All fields are required');
//     }

//     if (newpass.length < 8) {
//       return res.redirect('/admin/changepass?error=New password must be at least 8 characters long');
//     }

//     if (newpass === currentpass) {
//       return res.redirect('/admin/changepass?error=New password cannot be same as current password');
//     }

//     if (newpass !== cfnewpass) {
//       return res.redirect('/admin/changepass?error=New password and confirm password do not match');
//     }

//     if (!req.session.admin?.id) {
//       return res.redirect('/admin/login');
//     }

//     const admin = await Admin.findById(req.session.admin.id).select('+password');

//     if (!admin) {
//       return res.redirect('/admin/changepass?error=Admin not found');
//     }

//     const isMatch = await admin.comparePassword(currentpass);
//     if (!isMatch) {
//       return res.redirect('/admin/changepass?error=Current password is incorrect');
//     }

//     // Sirf password update (validation skip)
//     const hashedPassword = await bcrypt.hash(newpass, 10);
//     await Admin.findByIdAndUpdate(
//       req.session.admin.id,
//       { password: hashedPassword }
//     );

//     return res.redirect('/admin/logout?success=Password changed successfully');

//   } catch (error) {
//     console.error('Change Password Error:', error);
//     return res.redirect('/admin/changepass?error=Something went wrong. Please try again.');
//   }
// };

// exports.adminLogout = async (req, res) => {
//   try {
//     const adminId = req.admin._id;
//     const token = req.cookies.jwtAdmin;

//     if (token) {
//       await Session.deleteOne({ userId: adminId, token });
//       await RefreshToken.deleteOne({ userId: adminId });
//     }

//     res.clearCookie('jwtAdmin', {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'strict',
//       path: '/'
//     });

//     req.flash('success', 'Logged out successfully!');

//     return res.redirect('/admin/signin');

//   } catch (error) {
//     console.error('Admin Logout Error:', error);
//     req.flash('error', 'Logout failed. Please try again.');
//     return res.redirect('/admin/login');
//   }
// };


// /* ============================================
//    SUB ADMIN ROUTES (Only Super Admin Access)
//    ============================================ */

// // Get Sub Admin List
// exports.getSubAdminList = async (req, res) => {
//   try {
//     const subadmins = await Admin
//       .find({ role: 'A' })
//       .select('-password')
//       .sort({ createdAt: -1 });

//     res.render('subadmin_list', {
//       subadmins,
//       admin: req.admin,
//       title: "sub-admin",
//       url: req.originalUrl,
//       messages: req.flash()
//     });
//   } catch (error) {
//     req.flash('red', 'Error fetching sub admins');
//     res.redirect('/admin/dashboard');
//   }
// };

// // Render Add Sub Admin Form (unchanged - already good)
// exports.getAddSubAdmin = async (req, res) => {
//   try {
//     const modules = [
//       { key: 'customers', name: 'Customer Management' },
//       { key: 'drivers', name: 'Driver Management' },
//       { key: 'categories', name: 'Category Management' },
//       { key: 'orders', name: 'Order Management' },
//       { key: 'deliveries', name: 'Delivery Management' },
//       { key: 'vehicles', name: 'vehicle Management' },
//       { key: 'chat', name: 'Chat' },
//       { key: 'regions', name: 'regions' },
//       { key: 'expenses', name: 'Expense' },
//       { key: 'Remark', name: 'Remark' },
//       { key: 'cms', name: 'CMS' }
//     ];

//     res.render('subadmin_add', {
//       modules,
//       admin: req.admin,
//       title: 'Add Sub Admin',
//       url: req.originalUrl,
//       messages: req.flash() // ← Add this for flash messages
//     });
//   } catch (error) {
//     console.error('Get Add Sub Admin Error:', error);
//     req.flash('red', 'Error loading form');
//     res.redirect('/admin/sub-admin/list');
//   }
// };

// // Create Sub Admin - FIXED & ROBUST VERSION
// exports.postSubAdmin = async (req, res) => {
//   try {
//     console.log('=== SUB ADMIN FORM SUBMITTED ===');
//     console.log('Body Data:', req.body); // Yeh print hoga agar data aaya
//     console.log('Permissions Raw:', req.body.permissions);

//     const { name, email, phone, password, department, employeeId, permissions } = req.body;

//     if (!name || !email || !password) {
//       req.flash('red', 'Name, Email and Password are required!');
//       return res.redirect('/admin/sub-admin/add');
//     }

//     const isExists = await Admin.findOne({ email });
//     if (isExists) {
//       req.flash('red', 'This email address is already registered!');
//       return res.redirect('/admin/sub-admin/add');
//     }

//     let formattedPermissions = [];
//     if (permissions && typeof permissions === 'object') {
//       formattedPermissions = Object.keys(permissions).map(key => {
//         const p = permissions[key];
//         return {
//           key,
//           module: p.moduleName,
//           isView: p.isView === 'true',
//           isAdd: p.isAdd === 'true',
//           isEdit: p.isEdit === 'true',
//           isDelete: p.isDelete === 'true'
//         };
//       });
//     }

//     const newAdmin = await Admin.create({
//       name: name.trim(),
//       email: email.trim().toLowerCase(),
//       phone: phone || null,
//       password,
//       department: department || 'General',
//       employeeId: employeeId || `EMP-${Date.now()}`,
//       role: 'A',
//       permission: formattedPermissions,
//       isActive: true
//     });

//     console.log('Sub Admin Created Successfully:', newAdmin.email);
//     req.flash('green', 'Sub Admin added successfully!');
//     res.redirect('/admin/sub-admin/list');

//   } catch (error) {
//     console.error('Create Sub Admin Error:', error);
//     req.flash('red', error.message || 'Failed to create sub admin');
//     res.redirect('/admin/sub-admin/add');
//   }
// };
// // Change Sub Admin Status
// exports.changeAdminStatus = async (req, res) => {
//   try {
//     const admin = await Admin.findById(req.params.id);

//     if (!admin) {
//       req.flash('red', 'Sub Admin not found!');
//       return res.redirect('/admin/sub-admin/list');
//     }

//     if (admin.role === 'S') {
//       req.flash('red', 'Cannot change Super Admin status!');
//       return res.redirect('/admin/sub-admin/list');
//     }

//     admin.isActive = req.params.status === 'true';
//     await admin.save();

//     req.flash('green', 'Status changed successfully.');
//     res.redirect('/admin/sub-admin/list');

//   } catch (error) {
//     console.error('Change Status Error:', error);
//     req.flash('red', error.message || 'User not found!');
//     res.redirect('/admin/sub-admin/list');
//   }
// };

// // Render Edit Sub Admin Form
// exports.getEditSubAdmin = async (req, res) => {
//   try {
//     const admin = await Admin.findById(req.params.id);

//     if (!admin || admin.role === 'S') {
//       req.flash('red', 'Sub Admin not found!');
//       return res.redirect('/admin/sub-admin/list');
//     }

//     const modules = [
//       { key: 'customers', name: 'Customer Management' },
//       { key: 'drivers', name: 'Driver Management' },
//       { key: 'orders', name: 'Order Management' },
//       { key: 'deliveries', name: 'Delivery Management' },
//       { key: 'categories', name: 'Category Management' },
//       { key: 'vehicles', name: 'vehicle Management' },
//       { key: 'chat', name: 'Chat' },
//       { key: 'regions', name: 'regions' },
//       { key: 'expenses', name: 'Expense' },
//       { key: 'Remark', name: 'Remark' },
//       { key: 'cms', name: 'CMS' }
//     ];

//     res.render('subadmin_edit', {
//       admin: admin,
//       modules,
//       title: 'Edit Sub Admin',
//       url: req.originalUrl,
//       currentAdmin: req.admin
//     });

//   } catch (error) {
//     req.flash('red', 'Error loading sub admin');
//     res.redirect('/admin/sub-admin/list');
//   }
// };

// // Update Sub Admin
// exports.postEditSubAdmin = async (req, res) => {
//   try {
//     const { name, email, password, department, employeeId, permissions } = req.body;

//     const admin = await Admin.findById(req.params.id);

//     if (!admin || admin.role === 'S') {
//       req.flash('red', 'Sub Admin not found!');
//       return res.redirect('/admin/sub-admin/list');
//     }

//     // Format permissions
//     const formattedPermissions = Object.values(permissions || {}).map(perm => ({
//       key: perm.module,
//       module: perm.moduleName,
//       isView: perm.isView === 'true' || perm.isView === true,
//       isAdd: perm.isAdd === 'true' || perm.isAdd === true,
//       isEdit: perm.isEdit === 'true' || perm.isEdit === true,
//       isDelete: perm.isDelete === 'true' || perm.isDelete === true
//     }));

//     // Update fields
//     admin.name = name;
//     admin.email = email;
//     admin.department = department || admin.department;
//     admin.employeeId = employeeId || admin.employeeId;

//     if (password && password.trim() !== '') {
//       admin.password = password;
//     }

//     admin.permission = formattedPermissions;

//     await admin.save();

//     req.flash('green', 'Sub Admin updated successfully.');
//     res.redirect('/admin/sub-admin/list');

//   } catch (error) {
//     console.error('Update Sub Admin Error:', error);
//     req.flash('red', error.message || 'Something went wrong!');
//     res.redirect('/admin/sub-admin/list');
//   }
// };

// /// delete sub admin
// exports.deleteSubAdmin = async (req, res) => {
//   try {
//     console.log('Deleting sub-admin ID:', req.params.id);

//     const admin = await Admin.findById(req.params.id);
//     if (!admin) {
//       req.flash('red', 'Sub Admin not found!');
//       return res.redirect('/admin/sub-admin/list');
//     }

//     if (admin.role === 'S') {
//       req.flash('red', 'Cannot delete Super Admin!');
//       return res.redirect('/admin/sub-admin/list');
//     }

//     await Admin.findByIdAndDelete(req.params.id);
//     await Session.deleteMany({ adminId: req.params.id });
//     await RefreshToken.deleteMany({ userId: req.params.id });

//     req.flash('green', 'Sub Admin deleted successfully!');
//     res.redirect('/admin/sub-admin/list');

//   } catch (error) {
//     console.error('Delete Sub Admin Error:', error);
//     req.flash('red', 'Failed to delete sub admin');
//     res.redirect('/admin/sub-admin/list');
//   }
// };

// // controllers/admin/adminAuthController.js
// exports.updateSubAdminStatus = async (req, res) => {
//   try {
//     const { id, status } = req.params;

//     // "true"/"false" string ko boolean me convert karo
//     const isActive = status === 'true';

//     const updatedAdmin = await Admin.findByIdAndUpdate(
//       id,
//       { isActive: isActive },
//       { new: true }
//     );

//     if (!updatedAdmin) {
//       req.flash('error', 'Sub Admin not found');
//       return res.redirect('/admin/sub-admin/list');
//     }

//     req.flash(
//       'success',
//       `Sub Admin ${isActive ? 'activated' : 'deactivated'} successfully`
//     );

//     res.redirect('/admin/sub-admin/list');

//   } catch (error) {
//     console.error('Status Update Error:', error);
//     req.flash('error', 'Something went wrong');
//     res.redirect('/admin/sub-admin/list');
//   }
// };


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

const DASHBOARD_TZ = "Asia/Kolkata";

const ZODIAC_EMOJI = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋",
  Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏",
  Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
};

// exports.getDashboard = async (req, res) => {
//   try {
//     const todayStart = moment().tz(DASHBOARD_TZ).startOf("day").toDate();
//     const todayEnd = moment().tz(DASHBOARD_TZ).endOf("day").toDate();
//     const sevenDaysAgo = moment().tz(DASHBOARD_TZ).startOf("day").subtract(6, "days").toDate();

//     const [
//       totalUsers,
//       newSignupsToday,
//       activeSubscribers,
//       tarotDrawsToday,
//       zodiacAggregation,
//       weeklySignupsAggregation,
//     ] = await Promise.all([
//       User.countDocuments({ isPhoneVerified: true, status: { $ne: "deleted" } }),

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
//     const moonContent = await MoonPhaseInfo.findOne({ phaseName: moonPhase.phaseName });

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
//       messages: req.flash(),
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
//     res.render("index", {
//       title: "Dashboard",
//       adminName: req.session.admin?.name || "Admin",
//       url: "/admin",
//       messages: req.flash(),
//       stats: { totalUsers: 0, newSignupsToday: 0, activeSubscribers: 0, tarotDrawsToday: 0 },
//       moon: { phaseName: "-", currentSign: "-", illuminationPercent: 0, description: "" },
//       zodiacSigns: [],
//       weeklyTrend: { labels: [], data: [] },
//     });
//   }
// };

exports.getDashboard = async (req, res) => {
  try {
    // Cache disable – flash / query messages ke liye
    res.set({
      "Cache-Control": "no-store, no-cache, must-revalidate, private",
      Pragma: "no-cache",
      Expires: "0",
    });

    // ---- MESSAGES (flash + query string) ----
    let messages = {};
    try {
      const flashMsgs = typeof req.flash === "function" ? req.flash() : {};
      if (flashMsgs && typeof flashMsgs === "object") {
        messages = { ...flashMsgs };
      }
    } catch (e) {
      // flash fail ho to ignore
    }

    // Arrays ensure karo
    if (messages.error && !Array.isArray(messages.error)) {
      messages.error = [messages.error];
    }
    if (messages.success && !Array.isArray(messages.success)) {
      messages.success = [messages.success];
    }

    // Query string se error / success (permission deny yahan se aata hai)
    if (req.query.error) {
      if (!messages.error) messages.error = [];
      messages.error.push(String(req.query.error));
    }
    if (req.query.success) {
      if (!messages.success) messages.success = [];
      messages.success.push(String(req.query.success));
    }

    console.log(">>> DASHBOARD MESSAGES =", JSON.stringify(messages));

    const todayStart = moment().tz(DASHBOARD_TZ).startOf("day").toDate();
    const todayEnd = moment().tz(DASHBOARD_TZ).endOf("day").toDate();
    const sevenDaysAgo = moment()
      .tz(DASHBOARD_TZ)
      .startOf("day")
      .subtract(6, "days")
      .toDate();

    const [
      totalUsers,
      newSignupsToday,
      activeSubscribers,
      tarotDrawsToday,
      zodiacAggregation,
      weeklySignupsAggregation,
    ] = await Promise.all([
      User.countDocuments({
        isPhoneVerified: true,
        status: { $ne: "deleted" },
      }),

      User.countDocuments({
        isPhoneVerified: true,
        createdAt: { $gte: todayStart, $lt: todayEnd },
      }),

      UserSubscription.countDocuments({ status: "active" }),

      TarotDraw.countDocuments({
        date: { $gte: todayStart, $lt: todayEnd },
      }),

      User.aggregate([
        { $match: { "birthChart.sunSign": { $ne: null } } },
        { $group: { _id: "$birthChart.sunSign", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 4 },
      ]),

      User.aggregate([
        {
          $match: {
            isPhoneVerified: true,
            createdAt: { $gte: sevenDaysAgo, $lt: todayEnd },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
                timezone: DASHBOARD_TZ,
              },
            },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const moonPhase = calculateMoonPhase(new Date(), DASHBOARD_TZ);
    const moonContent = await MoonPhaseInfo.findOne({
      phaseName: moonPhase.phaseName,
    });

    const zodiacTotal = zodiacAggregation.reduce((sum, z) => sum + z.count, 0);
    const zodiacSigns = zodiacAggregation.map((z) => ({
      sign: z._id,
      emoji: ZODIAC_EMOJI[z._id] || "✨",
      percent: zodiacTotal > 0 ? Math.round((z.count / zodiacTotal) * 100) : 0,
    }));

    const countByDate = {};
    weeklySignupsAggregation.forEach((row) => {
      countByDate[row._id] = row.count;
    });

    const weeklyLabels = [];
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const d = moment().tz(DASHBOARD_TZ).startOf("day").subtract(i, "days");
      const key = d.format("YYYY-MM-DD");
      weeklyLabels.push(d.format("ddd"));
      weeklyData.push(countByDate[key] || 0);
    }

    res.render("index", {
      title: "Dashboard",
      adminName: req.session.admin?.name || "Admin",
      url: "/admin",
      messages,
      stats: {
        totalUsers,
        newSignupsToday,
        activeSubscribers,
        tarotDrawsToday,
      },
      moon: {
        phaseName: moonPhase.phaseName,
        currentSign: moonPhase.currentSign,
        illuminationPercent: moonPhase.illuminationPercent,
        description: moonContent?.description || "",
      },
      zodiacSigns,
      weeklyTrend: {
        labels: weeklyLabels,
        data: weeklyData,
      },
    });
  } catch (err) {
    console.error("Dashboard Error:", err);

    const messages = {};
    if (req.query.error) {
      messages.error = [String(req.query.error)];
    }
    if (req.query.success) {
      messages.success = [String(req.query.success)];
    }

    res.render("index", {
      title: "Dashboard",
      adminName: req.session.admin?.name || "Admin",
      url: "/admin",
      messages,
      stats: {
        totalUsers: 0,
        newSignupsToday: 0,
        activeSubscribers: 0,
        tarotDrawsToday: 0,
      },
      moon: {
        phaseName: "-",
        currentSign: "-",
        illuminationPercent: 0,
        description: "",
      },
      zodiacSigns: [],
      weeklyTrend: { labels: [], data: [] },
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