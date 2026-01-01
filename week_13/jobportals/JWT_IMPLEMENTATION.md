# JWT Implementation (Job Portals)

This project already implements JSON Web Token (JWT) authentication. This document explains where the implementation lives and how to use it for your assignment demo.

Key files
- `controllers/authController.js`: generates JWT on successful register/login using `jwt.sign({ id, role }, JWT_SECRET, { expiresIn })`. Also sets the token as an `httpOnly` cookie named `token`.
- `middleware/auth.js`: API middleware `authenticateToken`, `requireAdmin`, `requireMember` that verify JWT from `Authorization` header or `req.cookies.token` using `jwt.verify`.
- `middleware/viewAuth.js`: view middleware `attachCurrentUser` and `authenticateView` which verify cookie JWT and populate `res.locals.currentUser` for EJS views.

Security notes
- Token storage: this app uses `httpOnly` cookie (safer against XSS). API requests from client use `fetch(..., credentials: 'same-origin')` so cookie is sent.
- CSRF: mutating API endpoints are protected using `csurf` (if installed). The client fetches `/api/csrf` and sends `x-csrf-token` header for POST/PUT/DELETE.
- Do NOT store JWT in `localStorage` for production.

How to generate a demo token (CLI)
1. Ensure `.env` contains `JWT_SECRET` (and optionally `JWT_EXPIRES_IN`).
2. Run:

```
npm run gen:token -- --id=1
```

The script `scripts/generateToken.js` will output a JWT signed with your `JWT_SECRET` which you can use for manual testing (e.g., attach as `Authorization: Bearer <token>` when calling API via curl/postman).

Where to show in the assignment
- Explain token creation in `authController.js` and verification in `middleware/auth.js`.
- Demonstrate login flow (server sets httpOnly cookie) and protected API calls using that cookie.

If you want, I can also add a refresh-token flow (short-lived access token + long-lived refresh token in httpOnly cookie). Reply if you want that implemented.
