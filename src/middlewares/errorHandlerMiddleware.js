import { ValidationError, NotFoundError } from '../error.js';

const errorHandler = (err, req, res, next) => {
    // Specific handling — full control per error type
    if (err instanceof ValidationError) {
        return res.status(400).json({ error: err.message });
    }
    if (err instanceof NotFoundError) {
        return res.status(404).json({ error: err.message });
    }

    // Fallback — any custom error with statusCode
    if (err.statusCode) {
        return res.status(err.statusCode).json({ error: err.message });
    }

    // Unexpected errors
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
};

export default errorHandler;