const isProduction = process.env.APP_STAGE === 'prod';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const logger = (...args: any[]): void => {
  const msgs = [];

  for (let i = 0; i < args.length; i++) {
    msgs.push(args[i]);
  }

  if (isProduction) {
    // TODO: log to production logging system
    return;
  }

  // eslint-disable-next-line no-console, @typescript-eslint/no-unsafe-argument
  console.log('||||||||||||||||||||', ...msgs); // Pipes just allows me to identify the custom logs faster
};

// TODO: use a specialized logger or convert to a class for different log levels (info, warn, error etc)
