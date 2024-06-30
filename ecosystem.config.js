module.exports = {
  apps: [
    {
      name: "your-app-name",
      script: "./bin/www", // Your entry point script
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
