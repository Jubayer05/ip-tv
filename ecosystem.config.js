module.exports = {
  apps: [
    {
      name: "iptv-app",
      script: "server.js",
      cwd: "/var/www/cheapstreamtv",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "3G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        NODE_OPTIONS: "--max-old-space-size=3072",
      },
      env_file: ".env",
      error_file: "/var/log/pm2/iptv-error.log",
      out_file: "/var/log/pm2/iptv-out.log",
      log_file: "/var/log/pm2/iptv-combined.log",
      time: true,
      // Graceful shutdown
      kill_timeout: 10000,
      wait_ready: true,
      listen_timeout: 30000,
      // Restart policy
      exp_backoff_restart_delay: 100,
      max_restarts: 10,
      restart_delay: 5000,
    },
  ],
};
