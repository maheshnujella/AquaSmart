const Log = require('../models/Log');

const auditLog = (action) => {
  return async (req, res, next) => {
    const originalJson = res.json;
    res.json = function (data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const logData = {
          user: req.user ? req.user._id : null,
          action: action || `${req.method} ${req.originalUrl}`,
          details: {
            body: req.body,
            params: req.params,
            query: req.query,
            response: data
          },
          ip: req.ip,
          userAgent: req.get('User-Agent')
        };
        
        // Save log asynchronously
        Log.create(logData).catch(err => console.error('Audit Log Error:', err));
      }
      originalJson.call(this, data);
    };
    next();
  };
};

module.exports = auditLog;
