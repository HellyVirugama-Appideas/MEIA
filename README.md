# MEIA App Backend

Node.js + Express + MongoDB backend for the MEIA app, matching the Figma flow:
**Onboarding → Sign Up → OTP (Twilio) → MPIN Setup → Sign In → Forgot Password**

## Folder Structure

```
meia-backend/
├── server.js                     # entry point
├── app.js                        # express app setup
├── package.json
├── .env.example                  # copy to .env and fill values
├── config/
│   ├── db.js                     # mongodb connection
│   └── twilio.js                 # twilio client
├── models/
│   ├── User.js                   # user schema (password, mpin, otp, verification, preferences)
│   ├── OnboardingSlide.js        # splash/intro carousel content
│   └── OnboardingOption.js       # "Select..." screen options (goals/interests/etc.)
├── controllers/
│   ├── auth.controller.js        # ALL auth logic (signup/otp/mpin/signin/forgot-password)
│   └── onboarding.controller.js  # ALL onboarding logic (slides/select-screens/preferences)
├── routes/
│   ├── auth.routes.js            # ALL auth routes in a single file
│   └── onboarding.routes.js      # ALL onboarding routes in a single file
├── middleware/
│   ├── auth.middleware.js        # JWT protect middleware
│   └── errorHandler.js
├── seed/
│   └── onboarding.seed.js        # populates sample slides & options (npm run seed:onboarding)
└── utils/
    ├── generateOTP.js
    ├── generateToken.js
    ├── sendSMS.js                # twilio OTP sender
    └── response.js
```

## Setup

```bash
cd meia-backend
npm install
cp .env.example .env   # then fill in your Mongo URI, JWT secret, Twilio creds
npm run dev             # or: npm start
```

### Twilio Setup
1. Create account at https://www.twilio.com
2. Get `Account SID` and `Auth Token` from console dashboard
3. Buy/get a Twilio phone number and put it in `TWILIO_PHONE_NUMBER`
4. Put both in `.env`
5. If Twilio creds aren't set, OTPs are just printed to server console (for local dev testing without cost).

## Full API Flow (matches Figma screens)

Base URL: `http://localhost:5000/api/auth`

### A) Onboarding Flow (Splash → Slides → Select screens)
Base URL: `http://localhost:5000/api/onboarding`

| Step | Figma Screen | Method | Endpoint | Auth |
|---|---|---|---|---|
| 1 | Splash + Onboarding carousel | GET | `/slides` | Public |
| 2 | Select... (goals) | GET | `/options?category=goal` | Public |
| 3 | Select... (interests) | GET | `/options?category=interest` | Public |
| 4 | Save selections on Select screens | POST | `/preferences` | Protected |
| 5 | Finish onboarding → go to Home | POST | `/complete` | Protected |
| - | App launch check (show onboarding or not) | GET | `/status` | Protected |

**Flow detail:**
1. `GET /slides` → returns splash/carousel content `[{ title, description, image, order }]`.
2. `GET /options?category=goal` → options for 1st Select screen.
   `GET /options?category=interest` → options for 2nd Select screen.
   (also supports `experience_level`, `reminder_time` if you add more Select screens)
3. `POST /preferences` `{ goals: [...], interests: [...] }` (Bearer token, called after signup/mpin so user already has a JWT) → saves selections on user profile.
4. `POST /complete` (Bearer token) → sets `isOnboarded = true`.
5. `GET /status` (Bearer token) → app can call this on launch to decide whether to show onboarding/select screens again or go straight to Home.

Run `npm run seed:onboarding` once to populate sample slides & options in MongoDB so these APIs return real data immediately.

### B) Sign Up Flow
| Step | Figma Screen | Method | Endpoint |
|---|---|---|---|
| 1 | Sign up | POST | `/signup` |
| 2 | OTP Verification | POST | `/verify-otp` |
| 3 | (resend link on OTP screen) | POST | `/resend-otp` |
| 4 | New Mpin | POST | `/set-mpin` *(protected)* |
| 5 | Confirm Mpin → Welcome | POST | `/confirm-mpin` *(protected)* |

**Flow detail:**
1. `POST /signup` `{ name, email, phone, countryCode, password }` → creates user (unverified), sends OTP via Twilio, returns `userId`.
2. `POST /verify-otp` `{ phone, otp }` → verifies OTP, marks phone verified, returns a `verificationToken` (JWT) — use as `Authorization: Bearer <token>` for next steps.
3. `POST /set-mpin` `{ mpin }` (Bearer token) → stores MPIN (not yet finalized).
4. `POST /confirm-mpin` `{ mpin }` (Bearer token) → confirms MPIN matches, completes registration, returns final `token` + `user` object.

### C) Sign In Flow
| Step | Figma Screen | Method | Endpoint |
|---|---|---|---|
| 1 | Sign in | POST | `/signin` |
| 1b | Sign in via MPIN (Active screens) | POST | `/signin-mpin` |
| 2 | Forgot Password | POST | `/forgot-password` |
| 3 | OTP Verification | POST | `/verify-otp` |
| 4 | New Password | POST | `/reset-password` *(protected)* |

**Flow detail:**
1. `POST /signin` `{ phone, password }` → returns JWT `token` + `user`.
   OR `POST /signin-mpin` `{ phone, mpin }` → quick MPIN login.
2. If password forgotten: `POST /forgot-password` `{ phone }` → sends OTP.
3. `POST /verify-otp` `{ phone, otp }` (purpose auto-detected as `forgot_password`) → returns `verificationToken`.
4. `POST /reset-password` `{ phone, newPassword }` (Bearer `verificationToken`) → sets new password.

### D) Session
| Method | Endpoint | Description |
|---|---|---|
| GET | `/me` | Get logged-in user profile *(protected)* |
| POST | `/logout` | Logout *(protected)* |

### Generic OTP endpoint (used internally by resend/forgot flows)
| Method | Endpoint | Body |
|---|---|---|
| POST | `/send-otp` | `{ phone, purpose }` — purpose: `signup` \| `login` \| `forgot_password` |

## Response Format

Success:
```json
{ "success": true, "message": "...", "data": { } }
```

Error:
```json
{ "success": false, "message": "...", "errors": null }
```

## Notes
- Passwords and MPINs are hashed with bcrypt — never stored in plain text.
- OTP is 4-digit by default (configurable via `OTP_LENGTH`), expires in 5 minutes (`OTP_EXPIRY_MINUTES`).
- OTP requests are rate-limited (5 requests / 15 min per IP) to prevent SMS-cost abuse.
- All auth routes live in a single controller (`auth.controller.js`) and a single router (`auth.routes.js`) as requested, but logic is cleanly separated function-by-function per API.
- Extend `User` model / add new controllers (e.g. `profile.controller.js`, `meditation.controller.js`) for post-login app screens as needed.
