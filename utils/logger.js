const { createLogger, format, transports } = require("winston");
const path = require("path");

// Determine log level: DEBUG during development, INFO otherwise
const level = process.env.NODE_ENV === "production" ? "info" : "debug";

const logger = createLogger({
  level,
  format: format.combine(
    // Add a timestamp
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    // Colorize console output
    format.colorize({ all: true }),
    // Define the message format
    format.printf(({ timestamp, level, message, ...meta }) => {
      const metaString = Object.keys(meta).length ? JSON.stringify(meta) : "";
      return `[${timestamp}] ${level
        .toUpperCase()
        .padEnd(5)} ${message} ${metaString}`;
    })
  ),
  transports: [
    // Console transport (always show up in your terminal)
    new transports.Console(),

    // File transport for all logs (rotates daily)
    new transports.File({
      filename: path.join("logs", "combined.log"),
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
      tailable: true,
    }),

    // File transport for errors only
    new transports.File({
      filename: path.join("logs", "error.log"),
      level: "error",
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
      tailable: true,
    }),
  ],
  exitOnError: false,
});

module.exports = logger;
