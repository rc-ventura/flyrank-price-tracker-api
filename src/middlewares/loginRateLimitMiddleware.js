import { TooManyRequestsError } from "../error.js";

// Brute-force protection for POST /auth/login 
// Counts FAILED attempts (401 responses) per email (fallback: client IP).
// After MAX_FAILED_ATTEMPTS inside WINDOW_MS, further logins get 429 + Retry-After.
// A successful login (200) resets the counter. In-memory Map — per-instance,

const MAX_FAILED_ATTEMPTS = Number(process.env.LOGIN_MAX_FAILED_ATTEMPTS ?? 5);
const WINDOW_MS = Number(process.env.LOGIN_RATE_LIMIT_WINDOW_MS ?? 10 * 60 * 1000);

const attempts = new Map(); // key -> { count, firstAttemptAt }

const keyFor = (req) => {
    const email = req.body?.email;
    return (typeof email === 'string' && email.trim() !== '')
        ? `email:${email.trim().toLowerCase()}`
        : `ip:${req.ip}`;
}

const sweep = (now) => {
    for (const [key, entry] of attempts) {
        if (now - entry.firstAttemptAt >= WINDOW_MS) attempts.delete(key);
    }
}

const loginRateLimiter = (req, res, next) => {
    try {
        const now = Date.now();
        sweep(now);

        const key = keyFor(req);
        const entry = attempts.get(key);

        if (entry && entry.count >= MAX_FAILED_ATTEMPTS && now - entry.firstAttemptAt < WINDOW_MS) {
            const retryAfterSec = Math.ceil((WINDOW_MS - (now - entry.firstAttemptAt)) / 1000);
            res.set('Retry-After', String(retryAfterSec));
            throw new TooManyRequestsError(`Too many failed login attempts. Try again in ${retryAfterSec} seconds`);
        }

        res.on('finish', () => {
            if (res.statusCode === 401) {
                const current = attempts.get(key);
                if (!current || Date.now() - current.firstAttemptAt >= WINDOW_MS) {
                    attempts.set(key, { count: 1, firstAttemptAt: Date.now() });
                } else {
                    current.count += 1;
                }
            } else if (res.statusCode === 200) {
                attempts.delete(key);
            }
        });

        next();
    } catch (err) {
        next(err);
    }
}

export default loginRateLimiter;
