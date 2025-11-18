import { useState, useEffect } from "react";
import { Pill } from "../types";

export function usePills() {
  const [pills, setPills] = useState<Pill[]>([]);

  useEffect(() => {
    const fetchPills = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1.0/pills", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("薬剤マスタ取得失敗");
        const data: Pill[] = await res.json();
        setPills(data);
      } catch (err) {
        console.error("薬剤マスタ取得エラー:", err);
      }
    };

    fetchPills();
  }, []);

  return pills;
}
