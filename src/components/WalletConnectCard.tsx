"use client";

import { useEffect, useMemo, useState } from "react";

import type { Locale } from "@/content/datacenters";

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
      on?: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}

type WalletState = {
  account: string | null;
  chainId: string | null;
  connected: boolean;
  hasProvider: boolean;
  connecting: boolean;
  error: string | null;
};

const TARGET_CHAIN_ID_HEX = "0xd";
const TARGET_CHAIN_ID_DEC = 13;

function shortAddress(address: string | null): string {
  if (!address) return "—";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function formatChainLabel(chainId: string | null, locale: Locale): string {
  if (!chainId) return "—";
  const decimal = Number.parseInt(chainId, 16);
  return locale === "zh" ? `${chainId} / 十进制 ${decimal}` : `${chainId} / ${decimal}`;
}

function walletCopy(locale: Locale) {
  return {
    eyebrow: locale === "zh" ? "[ 钱包接入 ]" : "[ WALLET_ACCESS_LAYER ]",
    title: locale === "zh" ? "连接钱包，进入链上视图。" : "Connect MetaMask for on-chain access.",
    description:
      locale === "zh"
        ? "通过网页内置的钱包入口，直接接入 NOS 链，进入监控视图并进行链上交互。"
        : "Embed a native MetaMask entry so visitors can connect directly to NOS Chain and unlock monitoring-oriented on-chain interactions.",
    noProvider: locale === "zh" ? "未检测到钱包" : "MetaMask not detected",
    providerReady: locale === "zh" ? "钱包已就绪" : "MetaMask available",
    connected: locale === "zh" ? "钱包已连接" : "Wallet connected",
    disconnected: locale === "zh" ? "钱包未连接" : "Wallet disconnected",
    connect: locale === "zh" ? "连接钱包" : "Connect MetaMask",
    connecting: locale === "zh" ? "连接中..." : "Connecting...",
    install: locale === "zh" ? "安装钱包插件" : "Install MetaMask",
    switchNetwork: locale === "zh" ? "切换到 NOS 链" : "Switch to NOS Chain",
    connectedAccount: locale === "zh" ? "已连接地址" : "Connected account",
    activeNetwork: locale === "zh" ? "所在网络" : "Active network",
    targetNetwork: locale === "zh" ? "目标网络" : "Target network",
    chainReady: locale === "zh" ? "已切到 NOS 链" : "Aligned to NOS Chain",
    chainMismatch: locale === "zh" ? "当前未切到 NOS 链" : "Not on NOS Chain",
    openDapp: locale === "zh" ? "打开监控面板" : "Open Monitor DApp",
    dappHref: "https://wallet.web3s.finance/#/13.node-monitor",
    installHint:
      locale === "zh"
        ? "当前浏览器没有可用的钱包插件，请先安装后再连接。"
        : "No injected wallet provider was found in this browser. Install MetaMask first, then connect.",
    errorPrefix: locale === "zh" ? "连接出错" : "Connection error",
  };
}

export function WalletConnectCard({ locale }: { locale: Locale }) {
  const copy = useMemo(() => walletCopy(locale), [locale]);
  const [state, setState] = useState<WalletState>({
    account: null,
    chainId: null,
    connected: false,
    hasProvider: false,
    connecting: false,
    error: null,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const provider = window.ethereum;
    const hasProvider = !!provider;

    setState((prev) => ({ ...prev, hasProvider }));

    if (!provider) {
      return;
    }

    const sync = async () => {
      try {
        const [accounts, chainId] = await Promise.all([
          provider.request({ method: "eth_accounts" }) as Promise<string[]>,
          provider.request({ method: "eth_chainId" }) as Promise<string>,
        ]);

        const account = Array.isArray(accounts) && accounts.length > 0 ? accounts[0] : null;
        setState((prev) => ({
          ...prev,
          hasProvider: true,
          account,
          chainId: chainId ?? null,
          connected: !!account,
          error: null,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          hasProvider: true,
          error: error instanceof Error ? error.message : String(error),
        }));
      }
    };

    const handleAccountsChanged = (accounts: unknown) => {
      const next = Array.isArray(accounts) ? (accounts[0] as string | undefined) ?? null : null;
      setState((prev) => ({
        ...prev,
        account: next,
        connected: !!next,
      }));
    };

    const handleChainChanged = (chainId: unknown) => {
      setState((prev) => ({
        ...prev,
        chainId: typeof chainId === "string" ? chainId : null,
      }));
    };

    void sync();
    provider.on?.("accountsChanged", handleAccountsChanged);
    provider.on?.("chainChanged", handleChainChanged);

    return () => {
      provider.removeListener?.("accountsChanged", handleAccountsChanged);
      provider.removeListener?.("chainChanged", handleChainChanged);
    };
  }, []);

  const isTargetChain = state.chainId?.toLowerCase() === TARGET_CHAIN_ID_HEX;

  const connectWallet = async () => {
    const provider = window.ethereum;
    if (!provider) {
      window.open("https://metamask.io/download/", "_blank", "noopener,noreferrer");
      return;
    }

    setState((prev) => ({ ...prev, connecting: true, error: null }));

    try {
      const accounts = (await provider.request({ method: "eth_requestAccounts" })) as string[];
      const chainId = (await provider.request({ method: "eth_chainId" })) as string;
      const account = Array.isArray(accounts) && accounts.length > 0 ? accounts[0] : null;

      setState((prev) => ({
        ...prev,
        account,
        chainId: chainId ?? null,
        connected: !!account,
        connecting: false,
        hasProvider: true,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        connecting: false,
        error: error instanceof Error ? error.message : String(error),
      }));
    }
  };

  const switchChain = async () => {
    const provider = window.ethereum;
    if (!provider) return;

    setState((prev) => ({ ...prev, connecting: true, error: null }));
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: TARGET_CHAIN_ID_HEX }],
      });
      const chainId = (await provider.request({ method: "eth_chainId" })) as string;
      setState((prev) => ({ ...prev, chainId, connecting: false }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        connecting: false,
        error: error instanceof Error ? error.message : String(error),
      }));
    }
  };

  return (
    <div className="p-px" style={{ background: "var(--border)" }}>
      <div
        className="relative overflow-hidden flex h-full flex-col gap-8 p-8 lg:p-10 wallet-shell"
        style={{
          background: "var(--background-elevated)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 30px 80px rgba(0,0,0,0.18)",
        }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-60" style={{ background: "radial-gradient(circle at 15% 15%, rgba(109,93,252,0.16), transparent 28%), radial-gradient(circle at 85% 25%, rgba(34,211,238,0.14), transparent 26%), linear-gradient(135deg, rgba(255,255,255,0.02), transparent 48%)" }} />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)" }} />
        <div className="relative z-10 space-y-5">
          <div className="flex items-center gap-4">
            <span className="live-dot" />
            <p className="font-mono text-[10px] font-bold tracking-[0.3em]" style={{ color: "var(--accent-bright)" }}>
              {copy.eyebrow}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-3xl font-light tracking-tight lg:text-4xl" style={{ color: "var(--heading)" }}>
              {copy.title}
            </h3>
            <p className="max-w-2xl text-[15px] leading-[1.8]" style={{ color: "var(--body)" }}>
              {copy.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border px-3 py-1 font-mono text-[8px] tracking-[0.22em]" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "var(--accent-bright)" }}>
              {locale === "zh" ? "原生钱包接入" : "NATIVE WALLET ACCESS"}
            </span>
            <span className="rounded-full border px-3 py-1 font-mono text-[8px] tracking-[0.22em]" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "var(--cyan)" }}>
              {locale === "zh" ? "链上视图联动" : "ON-CHAIN VIEW LINKED"}
            </span>
          </div>
        </div>

        <div className="relative z-10 grid gap-px md:grid-cols-3" style={{ background: "var(--border)" }}>
          {[
            {
              label: copy.connectedAccount,
              displayLabel: copy.connectedAccount,
              value: shortAddress(state.account),
              tone: state.connected ? "var(--heading)" : "var(--muted-dim)",
            },
            {
              label: copy.activeNetwork,
              displayLabel: copy.activeNetwork,
              value: formatChainLabel(state.chainId, locale),
              tone: isTargetChain ? "var(--emerald)" : "var(--heading)",
            },
            {
              label: copy.targetNetwork,
              displayLabel: copy.targetNetwork,
              value: locale === "zh" ? `NOS 链 / ${TARGET_CHAIN_ID_HEX} / 十进制 ${TARGET_CHAIN_ID_DEC}` : `NOS Chain / ${TARGET_CHAIN_ID_HEX} / ${TARGET_CHAIN_ID_DEC}`,
              tone: "var(--accent-bright)",
            },
          ].map((item, index) => (
            <div key={item.label} className="space-y-2 p-5 wallet-metric-card" style={{ background: "var(--background)", animationDelay: `${index * 110}ms` }}>
              <p className="font-mono text-[8px] tracking-[0.18em]" style={{ color: "var(--muted)" }}>
                {locale === "zh" ? item.displayLabel : item.label.toUpperCase()}
              </p>
              <p className="font-mono text-[13px]" style={{ color: item.tone }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3 rounded-2xl border px-4 py-4 wallet-status-ribbon" style={{ borderColor: "var(--border)", background: "rgba(255,255,255,0.03)", backdropFilter: "blur(12px)" }}>
          <span className={state.hasProvider ? "live-dot" : "h-2 w-2 rounded-full bg-amber-500"} />
          <span className="font-mono text-[10px] uppercase tracking-[0.24em]" style={{ color: "var(--muted)" }}>
            {state.hasProvider ? copy.providerReady : copy.noProvider}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.24em]" style={{ color: state.connected ? "var(--emerald)" : "var(--muted-dim)" }}>
            {state.connected ? copy.connected : copy.disconnected}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.24em]" style={{ color: isTargetChain ? "var(--emerald)" : "var(--amber)" }}>
            {isTargetChain ? copy.chainReady : copy.chainMismatch}
          </span>
        </div>

        {state.error && (
          <div className="relative z-10 rounded-lg border px-4 py-3" style={{ borderColor: "rgba(255,107,107,0.35)", background: "rgba(255,107,107,0.06)" }}>
            <p className="text-[13px] leading-[1.7]" style={{ color: "var(--heading)" }}>
              {copy.errorPrefix}: {state.error}
            </p>
          </div>
        )}

        {!state.hasProvider && (
          <div className="relative z-10 rounded-lg border px-4 py-3" style={{ borderColor: "var(--border)", background: "var(--glass)" }}>
            <p className="text-[13px] leading-[1.7]" style={{ color: "var(--body)" }}>
              {copy.installHint}
            </p>
          </div>
        )}

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row">
          <button
            type="button"
            onClick={connectWallet}
            disabled={state.connecting}
            className="flex h-14 min-w-[220px] items-center justify-center bg-white px-8 text-[13px] font-bold tracking-widest text-black transition-all hover:bg-[var(--accent-bright)] hover:text-white disabled:cursor-not-allowed disabled:opacity-60 wallet-primary-action"
          >
            {state.connecting ? (locale === "zh" ? copy.connecting : copy.connecting.toUpperCase()) : (state.hasProvider ? (locale === "zh" ? copy.connect : copy.connect.toUpperCase()) : (locale === "zh" ? copy.install : copy.install.toUpperCase()))}
          </button>

          <button
            type="button"
            onClick={switchChain}
            disabled={!state.hasProvider || !state.connected || state.connecting || isTargetChain}
            className="flex h-14 min-w-[220px] items-center justify-center border bg-transparent px-8 text-[13px] font-bold tracking-widest transition-all hover:border-[var(--heading)] disabled:cursor-not-allowed disabled:opacity-50 wallet-secondary-action"
            style={{ borderColor: "var(--border)", color: "var(--heading)" }}
          >
            {locale === "zh" ? copy.switchNetwork : copy.switchNetwork.toUpperCase()}
          </button>

          <a
            className="flex h-14 min-w-[220px] items-center justify-center border px-8 text-[13px] font-bold tracking-widest transition-all hover:border-[var(--accent)] hover:text-[var(--accent-bright)] wallet-secondary-action"
            style={{ borderColor: "var(--border)", color: "var(--heading)" }}
            href={copy.dappHref}
            target="_blank"
            rel="noreferrer"
          >
            {locale === "zh" ? copy.openDapp : copy.openDapp.toUpperCase()}
          </a>
        </div>
      </div>
    </div>
  );
}
