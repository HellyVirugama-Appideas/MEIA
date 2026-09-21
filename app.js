const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const session = require("express-session"); 
const { MongoStore } = require("connect-mongo");

const authRoutes = require("./routes/user/authroutes");
const onboardingRoutes = require("./routes/user/onboardingroutes");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const path = require("path")
const flash = require('connect-flash');

const app = express();

// ===================== STRIPE WEBHOOK (must be BEFORE express.json()) =====================
// Stripe needs the raw body to verify webhook signatures - if this is
// mounted after express.json(), signature verification will always fail.
app.use("/api/subscription/webhook", require("./routes/user/subscriptionWebhookRoutes"));

// ===================== MIDDLEWARE =====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));


app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));


// ===================== SESSION SETUP (Important) =====================
app.use(session({
    secret: process.env.SESSION_SECRET || 'meia-admin-secret-key-2025-very-strong',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
        mongoUrl: process.env.MONGO_URI,
        collectionName: "sessions",
        ttl: 60 * 60 * 24 * 7,
    }), 
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));

// ... session ke baad add karo
app.use(flash());

// Flash messages ke liye global variables
app.use((req, res, next) => {
    res.locals.messages = req.flash();
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// ===================== ROUTES =====================
app.get("/", (req, res) => {
  res.json({ success: true, message: "MEIA API is running." });
});

app.use("/api/auth", authRoutes);
app.use("/api/onboarding", onboardingRoutes);

app.use("/api/profile", require("./routes/user/profileRoutes"));
app.use("/api/notifications", require("./routes/user/notificationRoutes"));
app.use("/api/faqs", require("./routes/user/faqRoutes"));
app.use("/api/contact", require("./routes/user/contactRoutes"));
app.use("/api/legal", require("./routes/user/legalRoutes"));


app.use("/api/home", require("./routes/user/homeRoutes"));
app.use("/api/daily-reading", require("./routes/user/dailyReadingRoutes"));
app.use("/api/celestial", require("./routes/user/celestialRoutes"));
app.use("/api/tarot", require("./routes/user/tarotRoutes"));
app.use("/api/ritual", require("./routes/user/ritualRoutes"));
app.use("/api/breathing", require("./routes/user/breathingRoutes"));
app.use("/api/journal", require("./routes/user/journalRoutes"));
app.use("/api/rhythm", require("./routes/user/rhythmRoutes"));
app.use("/api/subscription", require("./routes/user/subscriptionRoutes"));
app.use("/api/device", require("./routes/user/deviceRoutes"));

app.use("/api/bookmarks", require("./routes/user/bookmarkRoutes"));
app.use("/api/about",require("./routes/user/Aboutroutes"))

// ===================== ADMIN ROUTES =====================
app.use("/admin", require("./routes/admin/admin"));
app.use("/admin/rhythm", require("./routes/admin/Rhythmcontentroutes"));
app.use("/admin/cms", require("./routes/admin/LegalRoutes"))
app.use("/admin/celestial", require("./routes/admin/Celestialcontentroutes"))
app.use("/admin/contact", require("./routes/admin/ContactRoutes"))
app.use("/admin/user", require("./routes/admin/user"))
app.use("/admin/content", require("./routes/admin/contentRoutes"))
app.use("/admin/readings", require("./routes/admin/readingRoutes"))
app.use("/admin/notifications", require("./routes/admin/notificationRoutes"))
app.use("/admin/subscription", require("./routes/admin/subscriptionRoutes"))
app.use("/admin/journal", require("./routes/admin/Journalcategoryroutes"))
app.use("/admin/about", require("./routes/admin/Adminaboutroutes"))
app.use("/admin/onboarding", require("./routes/admin/Onboardingroutes"))


// ===================== ERROR HANDLING =====================
app.use(notFound);
app.use(errorHandler);

module.exports = app;