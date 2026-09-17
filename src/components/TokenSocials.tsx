"use client";

import { useEffect, useState } from "react";

type Profile = {
  website?: string;
  twitter?: string;
  telegram?: string;
};

export function TokenSocials({ address }: { address: string }) {
  const [p, setP] = useState<Profile>({});

  useEffect(() => {
    const all = JSON.parse(localStorage.getItem("geckohood-profiles") || "{}");
    setP(all[address.toLowerCase()] || {});
  }, [address]);

  const btn =
    "inline-flex items-center gap-1 rounded-full bg-[#1e2329] px-3 py-1 text-xs text-[#eaecef] hover:bg-[#2b3139]";

  return (
    <div className="mb-3 flex flex-wrap gap-2">
      {p.website ? (
        <a className={btn} href={p.website} target="_blank">
          Website
        </a>
      ) : (
        <span className={`${btn} opacity-40`}>Website</span>
      )}
      {p.twitter ? (
        <a className={btn} href={p.twitter} target="_blank">
          Twitter
        </a>
      ) : (
        <span className={`${btn} opacity-40`}>Twitter</span>
      )}
      {p.telegram ? (
        <a className={btn} href={p.telegram} target="_blank">
          Telegram
        </a>
      ) : (
        <span className={`${btn} opacity-40`}>Telegram</span>
      )}
    </div>
  );
}