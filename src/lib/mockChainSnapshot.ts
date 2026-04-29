export interface MockChainSnapshot {
  blockNumber: number;
  gasPriceGwei: string;
  chainId: number;
  txCount: number;
  rawBlockHash: string;
  rawMiner: string;
  gasUsed: number;
  gasLimit: number;
  timestamp: number;
  transactions: {
    hash: string;
    from: string;
    to: string;
    value: string;
    status: number;
  }[];
}

const NOS_WEI = BigInt("1000000000000000000");
const BASE_TIMESTAMP = Math.floor(Date.now() / 1000) - 120;
const HASH_CHARS = "abcdef0123456789";

const baseTransactions: MockChainSnapshot["transactions"] = [
  {
    hash: "0xe713cc9c0d4379516500f4b34d4ef3a4ed5f9f0fbf81126265e321a13e723d11",
    from: "0x42af88f1f0cf89a0f65ecf73d2a2cb1d8602f99a",
    to: "0x51cbb7e3fe9d6b9664bdaa33d91f05731f4ab9c7",
    value: (BigInt(184) * NOS_WEI / BigInt(1000)).toString(),
    status: 1,
  },
  {
    hash: "0x0f2d813baf4ec4f1df5f32e0ecfbba802dc2a35132f0df97cd5fd4fc208fa05a",
    from: "0x9b3ca70485f4bc6ff1cfb36ea6f4c8cd2b25f9d8",
    to: "0x24e5ca4a0dd84895fdbf7ff60d6ca6f2db279b17",
    value: (BigInt(63) * NOS_WEI / BigInt(1000)).toString(),
    status: 1,
  },
  {
    hash: "0x39145f432a95d01d9bc09aebf14f04f35aef0d254e7ea00e2da054fa1df1aa34",
    from: "0x7a1d5eb2cfb64bfe315f6ed39f6fc88a9a0d8897",
    to: "0x1ddbc1160fc17c2471d4a2d22fb4fdd3f5f71fd4",
    value: (BigInt(9) * NOS_WEI / BigInt(10000)).toString(),
    status: 1,
  },
  {
    hash: "0xa55f5c93be996126c42c327d43d49bce2350cc8cb4558f1904a92e2fe8c6bc02",
    from: "0xb6fdb4aa5d3b40b0d31845ebecf62df2ddf4e31f",
    to: "0x81f8e3c027fd2f9f7450f66a79c576ec4191c6dc",
    value: (BigInt(121) * NOS_WEI / BigInt(1000)).toString(),
    status: 1,
  },
  {
    hash: "0x842a5b1939ce3cc885848fae5ebd52da2f9b3b2a66df0a1fe01a9680c253fca8",
    from: "0x4be73d07867142d65da7f7f1b0f89cddcf668f25",
    to: "0x6c2d760ff1a4dbd26e94fd553c75b8607da4b3ad",
    value: (BigInt(37) * NOS_WEI / BigInt(1000)).toString(),
    status: 1,
  },
  {
    hash: "0xc314c7f9b7ff1c23bbef61fc0ef06c747f7ee5bd077c5aa4e16ec1ccf65ea62d",
    from: "0xf8a47136d31c06721d28db3d828781c52a2b73f4",
    to: "0x3150d01b47f0fd91110ff7ba052ecf72f10fa721",
    value: (BigInt(415) * NOS_WEI / BigInt(10000)).toString(),
    status: 1,
  },
];

function hashFromSeed(seed: number, prefix = "0x"): string {
  let out = prefix;
  for (let i = 0; i < 64; i += 1) {
    out += HASH_CHARS[(seed + i * 7) % HASH_CHARS.length];
  }
  return out;
}

function mutateAddress(addr: string, offset: number): string {
  const chars = addr.replace(/^0x/, "").split("");
  chars[chars.length - 1] = HASH_CHARS[offset % HASH_CHARS.length];
  chars[chars.length - 3] = HASH_CHARS[(offset + 5) % HASH_CHARS.length];
  return `0x${chars.join("")}`;
}

function createRollingTransaction(tick: number, index: number): MockChainSnapshot["transactions"][number] {
  const base = baseTransactions[index % baseTransactions.length];
  const amount = BigInt(18 + ((tick * 11 + index * 7) % 240));
  const divisor = BigInt(1000 + ((tick + index) % 3) * 200);
  return {
    hash: hashFromSeed(tick * 17 + index * 29),
    from: mutateAddress(base.from, tick + index),
    to: mutateAddress(base.to, tick * 3 + index),
    value: (amount * NOS_WEI / divisor).toString(),
    status: 1,
  };
}

export function createMockChainSnapshot(now = Date.now()): MockChainSnapshot {
  const tick = Math.floor(now / 15000);
  const animatedBlock = 2897341 + tick;
  const gasUsed = 17200000 + ((tick * 137911) % 6200000);
  const txCount = 112 + (tick % 37);
  const gasPrice = (0.16 + ((tick % 9) * 0.013)).toFixed(3);
  const timestamp = BASE_TIMESTAMP + tick * 12;

  return {
    blockNumber: animatedBlock,
    gasPriceGwei: gasPrice,
    chainId: 201606,
    txCount,
    rawBlockHash: hashFromSeed(tick * 19 + 3),
    rawMiner: `validator-core-${["asia", "eu", "us"][tick % 3]}-${String((tick % 5) + 1).padStart(2, "0")}`,
    gasUsed,
    gasLimit: 30000000,
    timestamp,
    transactions: Array.from({ length: 6 }, (_, index) => createRollingTransaction(tick, index)),
  };
}
