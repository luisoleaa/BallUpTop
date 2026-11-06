"use client";

// Follow/unfollow toggle on a profile page. Hidden on your own profile by
// the caller (ProfileClient), not here.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/app-store";
import { followAction, unfollowAction } from "@/lib/actions/follows";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";

export function FollowButton({
  targetId,
  initialFollowing,
}: {
  targetId: string;
  initialFollowing: boolean;
}) {
  const { user, showToast } = useApp();
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, setPending] = useState(false);

  const toggle = async () => {
    if (!user) {
      router.push(
        `/login?reason=rate&from=${encodeURIComponent(`/users/${targetId}`)}`,
      );
      return;
    }
    setPending(true);
    const prev = following;
    setFollowing(!prev);
    const result = prev
      ? await unfollowAction(targetId)
      : await followAction(targetId);
    if ("error" in result) {
      setFollowing(prev);
      showToast(result.error);
    } else {
      router.refresh();
    }
    setPending(false);
  };

  return (
    <Button
      variant={following ? "secondary" : "primary"}
      size="sm"
      pill
      disabled={pending}
      onClick={toggle}
      icon={
        following ? (
          <Icon name="check" size={14} stroke="var(--text)" />
        ) : undefined
      }
    >
      {following ? "Following" : "Follow"}
    </Button>
  );
}
