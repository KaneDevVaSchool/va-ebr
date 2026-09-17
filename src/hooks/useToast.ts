import { useCallback, useEffect, useRef, useState } from "react";

export function useToast(durationMs = 2800) {
  const [message, setMessage] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const showToast = useCallback(
    (msg: string) => {
      setMessage(msg);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setMessage(""), durationMs);
    },
    [durationMs],
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  return { message, showToast };
}
