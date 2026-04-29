"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createMockChainSnapshot } from "@/lib/mockChainSnapshot";

export interface ChainData {
  blockNumber: number;
  blockNumberHex: string;
  blockHash: string | null;
  parentHash: string | null;
  miner: string | null;
  timestamp: number;
  gasLimit: number;
  gasUsed: number;
  gasPriceGwei: string;
  chainId: number;
  txCount: number;
  transactions: {
    hash?: string;
    from?: string;
    to?: string | null;
    value?: string;
    gasUsed?: number;
    status?: number;
    contractAddress?: string | null;
  }[];
  rawBlockHash: string;
  rawMiner: string;
  error?: string;
}

export interface UseChainDataReturn {
  data: ChainData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  refresh: () => void;
}

const MAX_ACCUMULATED_TXS = 20;
const IS_GITHUB_PAGES = process.env.NEXT_PUBLIC_IS_GITHUB_PAGES === "true";

function buildMockChainData(): ChainData {
  const snapshot = createMockChainSnapshot();

  return {
    blockNumber: snapshot.blockNumber,
    blockNumberHex: `0x${snapshot.blockNumber.toString(16)}`,
    blockHash: snapshot.rawBlockHash,
    parentHash: "0x2f7d71efbbbc3f84d5a10a0bf2f9ac7f31c5fd97e280dd7d8ed4f1d4b6839b77",
    miner: snapshot.rawMiner,
    timestamp: snapshot.timestamp,
    gasLimit: snapshot.gasLimit,
    gasUsed: snapshot.gasUsed,
    gasPriceGwei: snapshot.gasPriceGwei,
    chainId: snapshot.chainId,
    txCount: snapshot.txCount,
    transactions: snapshot.transactions.map((tx) => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      status: tx.status,
    })),
    rawBlockHash: snapshot.rawBlockHash,
    rawMiner: snapshot.rawMiner,
  };
}

export function useChainData(pollIntervalMs = 15000): UseChainDataReturn {
  const [data, setData] = useState<ChainData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const mountedRef = useRef(true);
  const refreshRef = useRef<(() => void) | null>(null);
  const accumulatedTxsRef = useRef<ChainData["transactions"]>([]);

  const mergeTransactions = useCallback(
    (newTxs: ChainData["transactions"], blockNumber: number) => {
      const existing = accumulatedTxsRef.current;
      const existingHashes = new Set(existing.map((tx) => tx.hash).filter(Boolean));
      const fresh = newTxs.filter((tx) => !tx.hash || !existingHashes.has(tx.hash));
      const merged = [...fresh, ...existing].slice(0, MAX_ACCUMULATED_TXS);
      accumulatedTxsRef.current = merged;
      return merged;
    },
    [],
  );

  useEffect(() => {
    mountedRef.current = true;

    async function fetchChain() {
      try {
        if (IS_GITHUB_PAGES) {
          const mockData = buildMockChainData();
          accumulatedTxsRef.current = mockData.transactions;
          setData(mockData);
          setError(null);
          setLastUpdated(Date.now());
          return;
        }
        const res = await fetch("/api/chain", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as ChainData;
        if (!mountedRef.current) return;
        if (json.error) {
          setError(json.error);
          setData(null);
        } else {
          const mergedTxs = mergeTransactions(json.transactions, json.blockNumber);
          setData({ ...json, transactions: mergedTxs });
          setError(null);
          setLastUpdated(Date.now());
        }
      } catch (err) {
        if (!mountedRef.current) return;
        setError(err instanceof Error ? err.message : "Fetch failed");
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    }

    refreshRef.current = fetchChain;
    fetchChain();
    const id = setInterval(fetchChain, pollIntervalMs);
    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, [pollIntervalMs, mergeTransactions]);

  return { data, loading, error, lastUpdated, refresh: () => refreshRef.current?.() };
}
