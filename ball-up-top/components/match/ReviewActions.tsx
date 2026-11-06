"use client";

// Like + report controls for a real fan review (backed by a ratings row).
// Not shown on the mock SeedReview filler content, which has no rating_id
// to act against.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/app-store";
import { toggleReviewLikeAction } from "@/lib/actions/review-likes";
import { reportReviewAction } from "@/lib/actions/reports";
import { Icon } from "../ui/Icon";

export function ReviewActions({
  matchId,
  ratingId,
  initialLikeCount,
  initialLikedByMe,
}: {
  matchId: string;
  ratingId: string;
  initialLikeCount: number;
  initialLikedByMe: boolean;
}) {
  const { user, showToast } = useApp();
  const router = useRouter();
  const [liked, setLiked] = useState(initialLikedByMe);
  const [count, setCount] = useState(initialLikeCount);
  const [reported, setReported] = useState(false);

  const loginRedirect = () =>
    router.push(
      `/login?reason=rate&from=${encodeURIComponent(`/matches/${matchId}`)}`,
    );

  const handleLike = async () => {
    if (!user) {
      loginRedirect();
      return;
    }
    // Optimistic update, rolled back on error.
    const prevLiked = liked;
    const prevCount = count;
    setLiked(!prevLiked);
    setCount(prevLiked ? prevCount - 1 : prevCount + 1);

    const result = await toggleReviewLikeAction(ratingId);
    if ("error" in result) {
      setLiked(prevLiked);
      setCount(prevCount);
      showToast(result.error);
    }
  };

  const handleReport = async () => {
    if (!user) {
      loginRedirect();
      return;
    }
    setReported(true);
    const result = await reportReviewAction(ratingId);
    if ("error" in result) {
      setReported(false);
      showToast(result.error);
    } else {
      showToast("Reported. Thanks for flagging this.");
    }
  };

  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 10 }}
    >
      <button
        onClick={handleLike}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          border: "none",
          background: "transparent",
          cursor: "pointer",
          padding: 0,
          color: liked ? "var(--star)" : "var(--text-faint)",
          fontSize: 12,
          fontWeight: 700,
          fontFamily: "var(--font-mono, monospace)",
        }}
      >
        <Icon
          name="flame"
          size={13}
          stroke={liked ? "var(--star)" : "var(--text-faint)"}
        />
        {count > 0 ? count.toLocaleString() : "Like"}
      </button>
      <button
        onClick={handleReport}
        disabled={reported}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          border: "none",
          background: "transparent",
          cursor: reported ? "default" : "pointer",
          padding: 0,
          color: "var(--text-faint)",
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        <Icon name="flag" size={13} stroke="var(--text-faint)" />
        {reported ? "Reported" : "Report"}
      </button>
    </div>
  );
}
