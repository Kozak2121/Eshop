const winston = require('winston');

const tsFormat = () => {
  function getDateString(addT) {
    const time = new Date();
    time.setHours(time.getHours() + addT);
    return `${(time.getHours() < 10 ? '0' : '') +
      time.getHours()}:${time.getMinutes()}`;
  }
  return getDateString(3);
};

export const logger = new winston.Logger({
  transports: [
    // colorize the output to the console
    new winston.transports.Console({
      timestamp: tsFormat,
      handleExceptions: true,
      colorize: true
    }),
    new (require('winston-daily-rotate-file'))({
      filename: `logs/-results.log`,
      timestamp: tsFormat,
      handleExceptions: true,
      datePattern: 'yyyy-MM-dd',
      prepend: true,
      exitOnError: false,
      level: 'verbose'
    })
    /*   new (winston.transports.File)({
         filename: `results.log`,
         handleExceptions: true,
         timestamp: tsFormat,
         level:  'info'
       }) */
  ]
});
