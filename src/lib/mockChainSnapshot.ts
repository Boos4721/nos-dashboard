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

const minutesAgo = (minutes: number) => Math.floor(Date.now() / 1000) - minutes * 60;

export const mockChainSnapshot: MockChainSnapshot = {
  blockNumber: 2897341,
  gasPriceGwei: "0.18",
  chainId: 201606,
  txCount: 128,
  rawBlockHash: "0x9a7c4b13dfab029437fe91c0f0827da65c85b2d93d4ab5be3e8c55f1072ab441",
  rawMiner: "validator-core-asia-pacific-03",
  gasUsed: 18240671,
  gasLimit: 30000000,
  timestamp: minutesAgo(2),
  transactions: [
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
  ],
};
