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
  rack: string;
  ip: string;
  kernel: string;
  serviceWindow: string;
  bandwidthGbps: number;
  workload: string;
  notes: string;
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

  const workloads = [
    "route mesh balancing",
    "telemetry ingest",
    "validator sequencing",
    "secure access relay",
    "edge cache orchestration",
    "storage shard recovery",
    "inference request routing",
  ];

  const notes = [
    "thermal envelope stable",
    "reserved for peak window",
    "under redundancy watch",
    "eligible for traffic failover",
    "latency baseline healthy",
    "operating inside reserve band",
  ];

  const seed = dcId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) * 137;
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
      rack: `R-${Math.floor(rand() * 8) + 1}-${Math.floor(rand() * 24) + 1}`,
      ip: `10.${Math.floor(rand() * 30) + 10}.${Math.floor(rand() * 200) + 20}.${Math.floor(rand() * 220) + 10}`,
      kernel: rand() > 0.5 ? "Linux 6.8 LTS" : "Linux 6.6 LTS",
      serviceWindow: rand() > 0.6 ? "02:00-04:00 UTC" : "No active maintenance window",
      bandwidthGbps: Math.round((20 + rand() * 180) * 10) / 10,
      workload: workloads[Math.floor(rand() * workloads.length)],
      notes: notes[Math.floor(rand() * notes.length)],
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
