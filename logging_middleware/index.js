let currentSessionToken = "";

export const configureLoggerAuth = (token) => {
  currentSessionToken = token;
};

export const Log = async (stackName, logLevel, packageName, logMessage) => {
  const acceptableStacks = new Set(["backend", "frontend"]);
  const acceptableLevels = new Set(["debug", "info", "warn", "error", "fatal"]);
  const acceptablePackages = new Set([
    "cache", "controller", "cron_job", "db", "domain",
    "handler", "repository", "route", "service",
    "api", "component", "hook", "page", "state", "style",
    "auth", "config", "middleware", "utils"
  ]);

  if (!acceptableStacks.has(stackName) || !acceptableLevels.has(logLevel) || !acceptablePackages.has(packageName)) {
    return null;
  }

  const reqBody = {
    stack: stackName,
    level: logLevel,
    package: packageName,
    message: logMessage,
  };

  const reqHeaders = {
    "Content-Type": "application/json",
  };

  if (currentSessionToken) {
    reqHeaders["Authorization"] = `Bearer ${currentSessionToken}`;
  }

  try {
    const baseUrl = typeof window !== 'undefined' ? '' : 'http://20.207.122.201';
    const apiRes = await fetch(`${baseUrl}/evaluation-service/logs`, {
      method: "POST",
      headers: reqHeaders,
      body: JSON.stringify(reqBody),
    });

    if (!apiRes.ok) return null;
    return await apiRes.json();
  } catch (e) {
    return null;
  }
};
