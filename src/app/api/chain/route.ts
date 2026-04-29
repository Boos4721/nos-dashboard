import { NextResponse } from "next/server";

const RPC_URL = "https://rpc.noschain.org";
export const revalidate = 10;

type RpcRequest = { jsonrpc: string; method: string; params: unknown[]; id: number };

async function rpc(method: string, params: unknown[] = [], id = 1): Promise<unknown> {
  const body: RpcRequest = { jsonrpc: "2.0", method, params, id };
  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`RPC ${method} returned ${res.status}`);
  const json = (await res.json()) as { result?: unknown; error?: unknown };
  if (json.error) throw new Error(`RPC ${method} error: ${JSON.stringify(json.error)}`);
  return json.result;
}

function hexToNumber(hex: unknown): number {
  if (typeof hex !== "string") return 0;
  return parseInt(hex, 16);
}

function decimalStringToNumber(value: unknown): number {
  if (typeof value !== "string") return 0;
  return parseInt(value, 10);
}

function hexToDecimal(hex: unknown): string {
  if (typeof hex !== "string") return "0";
  return BigInt(hex).toString();
}

function hexToGwei(hex: unknown): string {
  if (typeof hex !== "string") return "0";
  const wei = BigInt(hex);
  const gwei = wei / BigInt(10 ** 9);
  return gwei.toString();
}

function shortHash(hash: unknown): string {
  if (typeof hash !== "string") return "—";
  return `${hash.slice(0, 10)}…${hash.slice(-8)}`;
}

interface RpcTransaction {
  hash?: string;
  from?: string;
  to?: string | null;
  value?: string;
  gasUsed?: string;
  status?: string;
  contractAddress?: string | null;
}

interface RpcBlock {
  number?: string;
  hash?: string;
  parentHash?: string;
  miner?: string;
  timestamp?: string;
  gasLimit?: string;
  gasUsed?: string;
  transactions?: RpcTransaction[];
  size?: string;
}

const MAX_RECENT_TX = 20;
const BACKFILL_BLOCKS = 12;

type TxView = {
  hash?: string;
  from?: string;
  to?: string | null;
  value?: string;
  gasUsed?: number;
  status?: number;
  contractAddress?: string | null;
  blockNumber?: number;
};

function mapTx(tx: RpcTransaction, blockNumber?: number): TxView {
  return {
    hash: tx.hash,
    from: tx.from,
    to: tx.to ?? null,
    value: hexToDecimal(tx.value),
    gasUsed: hexToNumber(tx.gasUsed),
    status: hexToNumber(tx.status),
    contractAddress: tx.contractAddress ?? null,
    blockNumber,
  };
}

async function collectRecentTransactions(latestBlockHex: string): Promise<TxView[]> {
  const latestBlockNumber = hexToNumber(latestBlockHex);
  const blockHexes = Array.from({ length: BACKFILL_BLOCKS }, (_, index) => {
    const current = latestBlockNumber - index;
    return current >= 0 ? `0x${current.toString(16)}` : null;
  }).filter((value): value is string => Boolean(value));

  const blocks = await Promise.all(
    blockHexes.map((blockHex, index) => rpc("eth_getBlockByNumber", [blockHex, true], 100 + index)),
  );

  const transactions = blocks.flatMap((block) => {
    const typedBlock = block as RpcBlock;
    const typedBlockNumber = hexToNumber(typedBlock.number);
    return (typedBlock.transactions ?? []).map((tx) => mapTx(tx, typedBlockNumber));
  });
  return transactions.slice(0, MAX_RECENT_TX);
}

export async function GET() {
  try {
    const [blockNumberHex, gasPriceHex, netVersion, block] = await Promise.all([
      rpc("eth_blockNumber"),
      rpc("eth_gasPrice"),
      rpc("eth_chainId"),
      rpc("eth_blockNumber").then((bn) => rpc("eth_getBlockByNumber", [bn, true])),
    ]);

    const b = block as RpcBlock;
    const blockNumber = hexToNumber(blockNumberHex);
    const latestBlockTransactions = (b.transactions ?? []).map((tx) => mapTx(tx, blockNumber));
    const recentTransactions =
      latestBlockTransactions.length >= MAX_RECENT_TX
        ? latestBlockTransactions.slice(0, MAX_RECENT_TX)
        : await collectRecentTransactions(blockNumberHex as string);

    return NextResponse.json(
      {
        blockNumber,
        blockNumberHex: blockNumberHex as string,
        blockHash: b.hash ?? null,
        parentHash: b.parentHash ?? null,
        miner: b.miner ?? null,
        timestamp: hexToNumber(b.timestamp),
        gasLimit: hexToNumber(b.gasLimit),
        gasUsed: hexToNumber(b.gasUsed),
        gasPriceGwei: hexToGwei(gasPriceHex),
        chainId: hexToNumber(netVersion),
        txCount: latestBlockTransactions.length,
        transactions: recentTransactions,
        rawBlockHash: shortHash(b.hash),
        rawMiner: shortHash(b.miner),
      },
      { status: 200 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown RPC error";
    return NextResponse.json({ error: message, blockNumber: null }, { status: 200 });
  }
}
