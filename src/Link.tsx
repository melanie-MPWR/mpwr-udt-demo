import { usePlaidLink } from "react-plaid-link";
import { FC, useCallback } from "react";

interface LinkProps {
  linkToken: string | null;
}
const Link: FC<LinkProps> = (props: LinkProps) => {
  const onSuccess = useCallback((public_token, metadata) => {
    // send public_token to server
    const response = fetch("http://127.0.0.1:8000/set_access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ public_token }),
    });
    // Handle response ...
  }, []);
  const config: Parameters<typeof usePlaidLink>[0] = {
    token: props.linkToken!,
    onSuccess,
  };
  const { open, ready } = usePlaidLink(config);
  return (
    <button onClick={() => open()} disabled={!ready}>
      Link account
    </button>
  );
};

export default Link;
