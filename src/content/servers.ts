export type ServerRole =
  | "Compute Node"
  | "Validator"
  | "API Gateway"
  | "Relay Node"
  | "AI Inference"
  | "Storage"
  | "Edge Proxy";

export type ServerStatus = "online" | "warning" | "offline" | "maintenance";

export type Server = {
  id: string;
  name: string;
  role: ServerRole;
  status: ServerStatus;
  cpu: number;
  memory: number;
  disk: number;
  temperature: number;
  powerWatts: number;
  uptime: string;
  lastSeen: string;
};

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateServers(dcId: string, count: number): Server[] {
  const roles: ServerRole[] = [
    "Compute Node",
    "Validator",
    "API Gateway",
    "Relay Node",
    "AI Inference",
    "Storage",
    "Edge Proxy",
  ];

  const seed =
    dcId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) * 137;
  const rand = rng(seed);

  return Array.from({ length: count }, (_, i) => {
    const r = rand();
    const status: ServerStatus =
      r > 0.92 ? "offline" : r > 0.85 ? "warning" : r > 0.82 ? "maintenance" : "online";
    const roleIdx = Math.floor(rand() * roles.length);
    const cpuBase = status === "offline" ? 0 : 20 + rand() * 60;
    const memBase = status === "offline" ? 0 : 30 + rand() * 55;
    const diskBase = 40 + rand() * 45;
    const tempBase = status === "offline" ? 0 : 38 + rand() * 30;
    const powerBase = status === "offline" ? 0 : 180 + rand() * 320;

    const now = Date.now();
    const lastSeenOffset =
      status === "offline"
        ? Math.floor(rand() * 7200)
        : status === "maintenance"
          ? Math.floor(rand() * 600)
          : Math.floor(rand() * 30);
    const lastSeenDate = new Date(now - lastSeenOffset * 1000);

    return {
      id: `${dcId}-srv-${String(i + 1).padStart(2, "0")}`,
      name: `${dcId.toUpperCase()}-${String(i + 1).padStart(2, "0")}`,
      role: roles[roleIdx],
      status,
      cpu: Math.round(cpuBase * 10) / 10,
      memory: Math.round(memBase * 10) / 10,
      disk: Math.round(diskBase * 10) / 10,
      temperature: Math.round(tempBase),
      powerWatts: Math.round(powerBase),
      uptime:
        status === "offline"
          ? "—"
          : `${Math.floor(rand() * 90 + 1)}d ${Math.floor(rand() * 24)}h`,
      lastSeen:
        status === "online"
          ? `${Math.floor(lastSeenOffset)}s ago`
          : lastSeenDate.toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }),
    };
  });
}

export const serversByDatacenter: Record<string, Server[]> = {
  yichang: generateServers("yichang", 18),
  shiyan: generateServers("shiyan", 14),
  kelamayi: generateServers("kelamayi", 20),
  singapore: generateServers("singapore", 16),
  "hong-kong": generateServers("hong-kong", 15),
  bangkok: generateServers("bangkok", 13),
  chengdu: generateServers("chengdu", 19),
  hangzhou: generateServers("hangzhou", 17),
};
