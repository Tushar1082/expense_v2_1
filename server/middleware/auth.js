// // middleware/auth.js

// const jwt = require('jsonwebtoken');
// const SECRET_KEY = process.env.JWT_SECRET || 'your_fallback_secret';

// function verifyToken(req, res, next) {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

//   if (!token) {
//     return res.status(401).json({ message: 'Access denied. Token missing.' });
//   }

//   try {
//     const decoded = jwt.verify(token, SECRET_KEY);
//     req.user = decoded; // Attach user info to request
//     next(); // Move to the next middleware or route
//   } catch (err) {
//     return res.status(403).json({ message: 'Invalid or expired token.' });
//   }
// }

// module.exports = verifyToken;


const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET;

function verifyToken(req, res, next) {
  // Allow unauthenticated access to POST /user
  if (req.method === 'POST' && req.originalUrl === '/user') {
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'Access denied. Token missing.' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    console.log(err);
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
}

module.exports = verifyToken;
