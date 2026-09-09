const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

const logFile = path.join(logsDir, `app-${new Date().toISOString().split('T')[0]}.log`);

const formatLog = (level, message, data = '') => {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] ${message} ${data}`;
};

const logger = {
    info: (message, data = '') => {
        const log = formatLog('INFO', message, data);
        console.log(log);
        fs.appendFileSync(logFile, log + '\n');
    },
    
    error: (message, data = '') => {
        const log = formatLog('ERROR', message, data);
        console.error(log);
        fs.appendFileSync(logFile, log + '\n');
    },
    
    warn: (message, data = '') => {
        const log = formatLog('WARN', message, data);
        console.warn(log);
        fs.appendFileSync(logFile, log + '\n');
    },
    
    debug: (message, data = '') => {
        if (process.env.NODE_ENV === 'development') {
            const log = formatLog('DEBUG', message, data);
            console.debug(log);
            fs.appendFileSync(logFile, log + '\n');
        }
    }
};

module.exports = logger;
