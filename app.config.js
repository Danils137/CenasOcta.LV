import 'dotenv/config';

export default ({ config }) => {
  return {
    ...config,
    extra: {
      // Environment variables
    },
  };
};
