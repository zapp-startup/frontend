import * as React from "react";
import { usePlaidLink as usePlaidLinkHook } from "react-plaid-link";
import { BankingAPI } from "@/api/banking.api";

type UsePlaidConnectParams = {
  onConnected?: () => void | Promise<void>;
};

type UsePlaidConnectReturn = {
  startConnect: () => void;
  isPreparingLink: boolean;
  isExchanging: boolean;
  linkError: string | null;
};

export function usePlaidConnect(params: UsePlaidConnectParams = {}): UsePlaidConnectReturn {
  const { onConnected } = params;
  const [linkToken, setLinkToken] = React.useState<string | null>(null);
  const [isPreparingLink, setIsPreparingLink] = React.useState(false);
  const [isExchanging, setIsExchanging] = React.useState(false);
  const [linkError, setLinkError] = React.useState<string | null>(null);

  const onSuccessCallback = React.useCallback(
    async (publicToken: string) => {
      setIsExchanging(true);
      setLinkError(null);
      try {
        await BankingAPI.exchangePublicToken(publicToken);
        setLinkToken(null);
        await onConnected?.();
      } catch (e) {
        setLinkError(e instanceof Error ? e.message : "Failed to connect bank");
      } finally {
        setIsExchanging(false);
      }
    },
    [onConnected]
  );

  const { open, ready } = usePlaidLinkHook({
    token: linkToken,
    onSuccess: onSuccessCallback,
    onExit: (err) => {
      if (err) {
        setLinkError(err.error_message ?? "Plaid Link exited with an error");
      }
      setLinkToken(null);
      setIsPreparingLink(false);
    },
  });

  const startConnect = React.useCallback(async () => {
    setIsPreparingLink(true);
    setLinkError(null);
    try {
      const { link_token } = await BankingAPI.createLinkToken();
      setLinkToken(link_token);
      setIsPreparingLink(false);
    } catch (e) {
      setLinkError(e instanceof Error ? e.message : "Failed to prepare bank connection");
      setIsPreparingLink(false);
    }
  }, []);

  React.useEffect(() => {
    if (linkToken && ready) {
      open();
    }
  }, [linkToken, ready, open]);

  return {
    startConnect,
    isPreparingLink,
    isExchanging,
    linkError,
  };
}
