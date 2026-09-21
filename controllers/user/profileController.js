// const User = require("../../models/User");
// const { success, error } = require("../../utils/response");

// /* ------------------------------------------------------------------ */
// /*  1. GET PROFILE -> GET /api/profile                                 */
// /*  (protected)                                                        */
// /* ------------------------------------------------------------------ */
// // exports.getProfile = async (req, res, next) => {
// //   try {
// //     const user = req.user;
// //     return success(res, "Profile fetched successfully.", { user: sanitizeUser(user) });
// //   } catch (err) {
// //     next(err);
// //   }
// // };

// exports.getProfile = async (req, res, next) => {
//   try {
//     const user = req.user;

//     console.log("===== GET PROFILE =====");
//     console.log("DB se aaya profilePhoto →", user.profilePhoto);

//     const sanitized = sanitizeUser(user);

//     console.log("Final profilePhoto jo bhej rahe hain →", sanitized.profilePhoto);
//     console.log("=======================");

//     return success(res, "Profile fetched successfully.", { user: sanitized });
//   } catch (err) {
//     next(err);
//   }
// };

// function sanitizeUser(user) {
//   // Default photo
//   const defaultPhoto = "/uploads/profiles/default-profile.png";

//   // null, undefined ya empty ho to default use karo
//   const photo = user.profilePhoto || defaultPhoto;

//   return {
//     id: user._id,
//     name: user.name,
//     email: user.email,
//     phone: user.phone,
//     countryCode: user.countryCode,
//     profilePhoto: photo,
//     isOnboarded: user.isOnboarded,
//     isMpinSet: user.isMpinSet ?? false,
//     birthInfo: user.birthInfo,
//     cycleInfo: user.cycleInfo,
//     personalization: user.personalization,
//     createdAt: user.createdAt,
//   };
// }


// /* ------------------------------------------------------------------ */
// /*  2. EDIT PROFILE -> PUT /api/profile                                */
// /*  (protected)                                                        */
// /* ------------------------------------------------------------------ */
// exports.updateProfile = async (req, res, next) => {
//   try {
//     const { name, email, timeZone } = req.body;
//     const user = req.user;

//     if (name !== undefined) user.name = name;
//     if (email !== undefined) user.email = email;

//     // 👇 File Multer se aayi hai (link nahi, actual uploaded image)
//     if (req.file) {
//       user.profilePhoto = `/uploads/profiles/${req.file.filename}`;
//     }

//     if (timeZone !== undefined) {
//       if (!user.personalization) user.personalization = {};
//       user.personalization.timeZone = timeZone;
//     }

//     await user.save();

//     return success(res, "Profile updated successfully.", { user: sanitizeUser(user) });
//   } catch (err) {
//     if (err.message && err.message.includes("Only image files")) {
//       return error(res, err.message, 422);
//     }
//     next(err);
//   }
// };
// /* ------------------------------------------------------------------ */
// /*  3. DELETE ACCOUNT -> DELETE /api/profile                           */
// /*  (protected) - soft delete, keeps data for records                  */
// /* ------------------------------------------------------------------ */
// // exports.deleteProfile = async (req, res, next) => {
// //   try {
// //     const user = req.user;

// //     // Soft delete
// //     user.status = "deleted";

// //     // Email remove nahi kar rahe hain.
// //     // Isse login ke time deleted account ko identify karke block kar sakte hain.

// //     await user.save();

// //     return success(res, "Account deleted successfully.");
// //   } catch (err) {
// //     next(err);
// //   }
// // };


// exports.deleteProfile = async (req, res, next) => {
//   try {
//     const user = req.user;

//     if (!user) {
//       return error(res, "User not found.", 404);
//     }

//     // Permanently delete user account
//     await User.deleteOne({ _id: user._id });

//     return success(res, "Account deleted successfully.");
//   } catch (err) {
//     next(err);
//   }
// };

const User = require("../../models/User");
const { success, error } = require("../../utils/response");

/* ------------------------------------------------------------------ */
/*  1. GET PROFILE -> GET /api/profile                                 */
/*  (protected)                                                        */
/* ------------------------------------------------------------------ */
exports.getProfile = async (req, res, next) => {
  try {
    const user = req.user;

    const sanitized = sanitizeUser(user);

    return success(res, "Profile fetched successfully.", { user: sanitized });
  } catch (err) {
    next(err);
  }
};

function sanitizeUser(user) {
  // Default photo
  const defaultPhoto = "/uploads/profiles/default-profile.png";

  // null, undefined ya empty ho to default use karo
  const photo = user.profilePhoto || defaultPhoto;

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    countryCode: user.countryCode,
    profilePhoto: photo,
    isOnboarded: user.isOnboarded,
    isMpinSet: user.isMpinSet ?? false,
    birthInfo: user.birthInfo,
    cycleInfo: user.cycleInfo,
    personalization: user.personalization,
    createdAt: user.createdAt,
  };
}


/* ------------------------------------------------------------------ */
/*  2. EDIT PROFILE -> PUT /api/profile                                */
/*  (protected)                                                        */
/*  NEW: birthDate, birthPlace, birthTime, gender added - these are    */
/*  the "Birth Info" edit screens (Figma). They live under             */
/*  user.birthInfo, same object the onboarding flow already writes to. */
/* ------------------------------------------------------------------ */
exports.updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      email,
      timeZone,
      birthDate,
      birthPlace,
      birthTime,
      gender,
    } = req.body;

    const user = req.user;

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;

    // 👇 File Multer se aayi hai (link nahi, actual uploaded image)
    if (req.file) {
      user.profilePhoto = `/uploads/profiles/${req.file.filename}`;
    }

    if (timeZone !== undefined) {
      if (!user.personalization) user.personalization = {};
      user.personalization.timeZone = timeZone;
    }

    // ---------------------------------------------------------------
    // Birth Info (Birth Date / Birth Place / Birth Time / Gender)
    // ---------------------------------------------------------------
    if (
      birthDate !== undefined ||
      birthPlace !== undefined ||
      birthTime !== undefined ||
      gender !== undefined
    ) {
      if (!user.birthInfo) user.birthInfo = {};

      if (birthDate !== undefined) user.birthInfo.birthDate = birthDate;
      if (birthPlace !== undefined) user.birthInfo.birthPlace = birthPlace;
      if (birthTime !== undefined) user.birthInfo.birthTime = birthTime;
      if (gender !== undefined) user.birthInfo.gender = gender;

      // NOTE: if birth chart (sunSign/moonSign/ascendant) needs to be
      // recalculated whenever birth info changes, that recalculation
      // logic (whatever util was used during onboarding) should be
      // called here too. Not added since that util wasn't shared with
      // me - let me know if you want that wired in as well.
    }

    await user.save();

    return success(res, "Profile updated successfully.", { user: sanitizeUser(user) });
  } catch (err) {
    if (err.message && err.message.includes("Only image files")) {
      return error(res, err.message, 422);
    }
    next(err);
  }
};
/* ------------------------------------------------------------------ */
/*  3. DELETE ACCOUNT -> DELETE /api/profile                           */
/*  (protected) - soft delete, keeps data for records                  */
/* ------------------------------------------------------------------ */
exports.deleteProfile = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      return error(res, "User not found.", 404);
    }

    // Permanently delete user account
    await User.deleteOne({ _id: user._id });

    return success(res, "Account deleted successfully.");
  } catch (err) {
    next(err);
  }
};