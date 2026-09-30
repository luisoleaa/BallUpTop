import { LiveGamesClient } from "@/components/live/liveGamesClient";

export default function LiveTestPage() {
  return (
    <div style={{ padding: "20px" }}>
      <h1> Live MLB Games </h1>
      <LiveGamesClient />
    </div>
  );
}
