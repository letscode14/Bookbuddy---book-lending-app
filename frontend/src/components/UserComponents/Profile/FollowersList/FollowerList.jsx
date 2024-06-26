import React, { useState, useEffect } from "react";
import {
  fetchF,
  followUser,
  unfollowUser,
} from "../../../../Service/Apiservice/UserApi";

export default function FollowerList({ user }) {
  const [followingIds, setFollowingId] = useState({});
  const [followersIds, setFollowersId] = useState({});
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const followingMap = {};
    user.following.forEach((p) => {
      followingMap[p.userId] = true;
    });
    setFollowingId(followingMap);

    const fetchFollowers = async () => {
      try {
        const response = await fetchF({ userId: user._id, query: "followers" });

        if (response) {
          setFollowers(response.followers);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchFollowers();

    const followersMap = {};
    user.followers.forEach((follower) => {
      followersMap[follower.userId] = true;
    });
    setFollowersId(followersMap);
  }, []);

  const handleFollow = async (userId, target) => {
    try {
      const response = await followUser(userId, target);
      if (response) {
        setFollowingId((prev) => ({ ...prev, [target]: true }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleUnFollow = async (userId, target) => {
    try {
      const response = await unfollowUser(userId, target);
      if (response) {
        setFollowingId((prev) => ({ ...prev, [target]: false }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const ImageComponent = React.lazy(() =>
    import("../../../ImageComponent/Image")
  );

  return (
    <div className="min-w-[500px] min-h-[650px] max-h-[650px] p-4 overflow-y-auto">
      <div className="text-xl font-semibold">Followers</div>
      <div className="border mt-2"></div>
      {loading ? (
        <div className="flex justify-center items-center mt-3">
          <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-[#512da8]"></div>
        </div>
      ) : followers.length ? (
        followers.map((f, index) => (
          <div key={index} className="my-3 flex justify-between items-center">
            <div className="flex items-top ">
              <div className="w-11 h-11">
                <div className="rounded-full flex items-center justify-center overflow-hidden">
                  <React.Suspense
                    fallback={
                      <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-[#512da8]"></div>
                    }
                  >
                    <ImageComponent src={f.userId.profileUrl} />
                  </React.Suspense>
                </div>
              </div>
              <div>
                <div className="ms-2 ">{f?.userId?.userName}</div>
                <div className="ms-2 text-xs">{f?.userId?.name}</div>
              </div>
            </div>
            <div>
              {followersIds[f?.userId?._id] && followingIds[f?.userId?._id] ? (
                <button
                  onClick={() => handleUnFollow(user._id, f?.userId?._id)}
                  className="uppercase py-1 font-bold px-5 text-[#512da8] text-[11px] rounded-xl border-[#512da8] border"
                >
                  Unfollow
                </button>
              ) : (
                <button
                  onClick={() => handleFollow(user._id, f.userId._id)}
                  className="uppercase py-1 font-bold px-5 text-[11px] rounded-xl text-[#ffffff] bg-[#512da8] border"
                >
                  follow back
                </button>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center mt-2 text-gray-500 text-sm">
          No followers
        </div>
      )}
    </div>
  );
}
