import { execFileSync } from "node:child_process";

const port = process.env.PORT ?? "7000";

function stopWindowsPortListener() {
  const command = `$connections = Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue; foreach ($connection in @($connections)) { $owner = $connection.OwningProcess; if ($owner -and $owner -ne $PID) { Stop-Process -Id $owner -Force -ErrorAction SilentlyContinue } }; exit 0`;

  execFileSync("powershell.exe", ["-NoProfile", "-Command", command], {
    stdio: "ignore"
  });
}

export default async function globalTeardown() {
  if (process.platform === "win32") {
    stopWindowsPortListener();
  }
}
