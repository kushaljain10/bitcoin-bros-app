/* eslint-disable @next/next/no-img-element */
import { Loading, MetaTags } from "@/components";
import { useAuth, useWeb3 } from "@/hooks";
import { Check } from "@/icons";
import axios from "axios";
import { NextPage } from "next";
import { Space_Grotesk } from "next/font/google";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "react-query";
import tweets from "./../config/tweetMessages.json";

// get random tweet message
const randomTweetMessage = () => {
  const randomIndex = Math.floor(Math.random() * tweets.length);
  return tweets[randomIndex];
};

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

const Home: NextPage = () => {
  const { openConnectModal, address } = useWeb3();
  const { login, isLoggedIn } = useAuth();

  const [isTweetSharable, setTweetSharable] = useState<boolean>(false);
  const [isRateLimitExceeded, setRateLimitExceeded] = useState<boolean>(false);

  const { mutate, isLoading: isLoadingAuth } = useMutation((data: any) =>
    axios.post("/api/auth", data)
  );

  const {
    data: userData,
    refetch: refetchUser,
    isFetching: isFetchingMe,
    isLoading: isLoadingMe,
  } = useQuery(["me"], () => axios.get("/api/me"), {
    enabled: isLoggedIn,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const {
    refetch: followBB,
    isLoading: isLoadingFollow,
    isFetching: isFetchingFollow,
  } = useQuery(["follow"], () => axios.get("/api/follow"), {
    enabled: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
    onError: (error: any) => {
      console.log(error.response);
      if (error?.response?.status === 429) {
        setRateLimitExceeded(true);
      }
    },
  });

  const { mutate: postBB, isLoading: isLoadingPost } = useMutation(
    (data: any) => axios.post("/api/post", data)
  );

  const {
    refetch: connectTwitter,
    isLoading: isLoadingTwitterAuth,
    isFetching: isFetchingTwitterAuth,
  } = useQuery(["twitter", "auth"], () => axios.post("/api/twitter/auth"), {
    enabled: false,
  });

  const connect = async () => {
    const data = await connectTwitter();
    if (data) {
      window.open(data.data?.data.url, "_parent");
    }
  };

  const follow = async () => {
    const data = await followBB();
    if (data.data?.data.success) {
      refetchUser();
    }
  };

  const post = async () => {
    postBB(
      {
        id: whitelistTweet.id,
      },
      {
        onSuccess: (data) => {
          if (data.data.success) {
            refetchUser();
          }
        },
        onError: (error: any) => {
          console.log(error.response);
          window.open(whitelistTweet.shareLink, "_blank");
        },
      }
    );
  };

  useEffect(() => {
    if (
      userData?.data &&
      (isRateLimitExceeded ||
        (userData?.data.isFollowing && !userData?.data.isWhitelistPostShared))
    ) {
      setTweetSharable(true);
    }
    if (userData?.data && userData?.data.isWhitelistPostShared) {
      setTweetSharable(false);
    }
  }, [isRateLimitExceeded, userData?.data]);

  useEffect(() => {
    if (address) {
      mutate(
        { walletAddress: address },
        {
          onSuccess: (data) => {
            console.log(data);
            login(data.data.token, data.data.tokenExpiry, data.data.user);
          },
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  const whitelistTweet = useMemo(randomTweetMessage, []);

  return (
    <main
      className={`flex flex-col justify-between bg-black min-h-screen w-screen p-8 ${spaceGrotesk.className}`}
    >
      <MetaTags />
      <video
        autoPlay
        loop
        muted
        className="fixed z-0 inset-0 w-full h-full bg-[#06041e] object-bottom landscape:object-center"
      >
        <source
          src="https://cdn.discordapp.com/attachments/1115714210308050954/1118238055040553001/bikers_loop_06_1.mp4"
          type="video/mp4"
        />
      </video>
      <header className="flex-shrink-0 relative">
        <Image
          src="https://static.cdn.zo.xyz/app-media/animojis/zobitcoin.gif"
          alt="zo"
          width={48}
          height={48}
        />
      </header>
      <section className="flex-1 mt-24 flex max-w-md w-full flex-col relative landscape:justify-center">
        <h1 className="text-6xl font-bold text-zinc-100">Bitcoin Bros</h1>
        <p className="text-lg text-zinc-300 mt-8">Join the whitelist.</p>
        <div className="mt-4 flex flex-col space-y-1 w-full">
          {isLoggedIn && userData?.data.walletAddress ? (
            <div className="py-4 px-8 flex bg-zinc-900 items-center justify-between">
              <div className="flex items-center space-x-4">
                <img
                  src="https://static.cdn.zo.xyz/app-media/logos/bitcoin.svg"
                  className="w-6 h-6 mr-4"
                  alt="bitcoin"
                />
                <span className="font-medium text-zinc-50">
                  {userData.data.walletAddress.slice(0, 6)}...
                  {userData.data.walletAddress.slice(-4)}
                </span>
              </div>
              <Check />
            </div>
          ) : (
            <button
              className="bg-zinc-100 py-4 px-8 flex items-center"
              onClick={openConnectModal}
            >
              <img
                src="https://static.cdn.zo.xyz/app-media/logos/bitcoin.svg"
                className="w-6 h-6 mr-4"
                alt="bitcoin"
              />
              <span className="font-medium text-black">
                Connect Bitcoin Ordinals Wallet
              </span>
            </button>
          )}
          {isLoggedIn && userData?.data.twitterUser ? (
            <div className="py-4 px-8 flex bg-zinc-900 items-center justify-between">
              <div className="flex items-center space-x-4">
                <img
                  src="https://static.cdn.zo.xyz/app-media/logos/twitter-circle.svg"
                  className="w-6 h-6 mr-4"
                  alt="bitcoin"
                />
                <span className="font-medium text-zinc-50">
                  @{userData.data.twitterUser.username}
                </span>
              </div>
              <Check />
            </div>
          ) : (
            <button
              className="bg-zinc-100 py-4 px-8 flex items-center disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!userData?.data.walletAddress}
              onClick={connect}
            >
              <img
                src="https://static.cdn.zo.xyz/app-media/logos/twitter-circle.svg"
                className="w-6 h-6 mr-4"
                alt="bitcoin"
              />
              <span className="font-medium text-black">Connect Twitter</span>
            </button>
          )}
          {isLoggedIn ? (
            userData?.data.isFollowing ? (
              <div className="py-4 px-8 flex bg-zinc-900 items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src="https://static.cdn.zo.xyz/app-media/logos/bitcoin-bros.jpeg"
                    className="w-6 h-6 mr-4 rounded-full"
                    alt="bitcoin"
                  />
                  <span className="font-medium text-zinc-50">
                    Following @BitcoinBrosXYZ
                  </span>
                </div>
                <Check />
              </div>
            ) : isRateLimitExceeded ? null : (
              <button
                className="bg-zinc-100 py-4 px-8 flex items-center disabled:cursor-not-allowed disabled:opacity-30"
                onClick={follow}
                disabled={!userData?.data?.twitterUser}
              >
                <img
                  src="https://static.cdn.zo.xyz/app-media/logos/bitcoin-bros.jpeg"
                  className="w-6 h-6 mr-4 rounded-full"
                  alt="bitcoin"
                />
                <span className="font-medium text-black">
                  Follow @BitcoinBrosXYZ
                </span>
              </button>
            )
          ) : (
            <button
              className="bg-zinc-100 py-4 px-8 flex items-center disabled:cursor-not-allowed disabled:opacity-30"
              disabled={
                !userData?.data.walletAddress || !userData?.data.twitterUser
              }
              onClick={follow}
            >
              <img
                src="https://static.cdn.zo.xyz/app-media/logos/bitcoin-bros.jpeg"
                className="w-6 h-6 mr-4 rounded-full"
                alt="bitcoin"
              />
              <span className="font-medium text-black">
                Follow @BitcoinBrosXYZ
              </span>
            </button>
          )}

          {isLoggedIn ? (
            userData?.data.isFollowing ? (
              <div className="py-4 px-8 flex bg-[#CFFF50] items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Check fill="#18181b" />
                  <span className="font-medium text-zinc-900">
                    You&apos;re in, Bro!
                  </span>
                </div>
              </div>
            ) : isRateLimitExceeded ? (
              <div className="py-4 px-8 flex bg-[#CFFF50] items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Check fill="#18181b" />
                  <span className="font-medium text-zinc-900">
                    You&apos;re in, Bro! Follow us on{" "}
                    <a
                      href="https://www.twitter.com/BitcoinBrosXYZ"
                      className="underline font-bold"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Twitter
                    </a>{" "}
                    to stay updated.
                  </span>
                </div>
              </div>
            ) : null
          ) : null}
        </div>
        {isTweetSharable
          ? userData?.data?.twitterUser && (
              <>
                <div className="mt-8">
                  <h2 className="font-medium text-2xl text-zinc-100">
                    It&apos;s time to get proud
                    <br />
                    and loud on Twitter
                  </h2>
                </div>
                <>
                  <button
                    className="bg-blue-400 max-w-md w-full py-4 px-8 mt-4 font-medium"
                    onClick={post}
                  >
                    Share Tweet
                  </button>
                  <div className="flex flex-col max-w-md bg-zinc-900 text-zinc-100 p-4">
                    <div className="flex space-x-4">
                      <div className="w-12 h-12 flex-shrink-0 bg-zinc-700 rounded-full"></div>
                      <div className="flex flex-col">
                        <span className="font-semibold">
                          {userData?.data.twitterUser.name}
                        </span>
                        <span className="font-medium text-sm text-zinc-300">
                          @{userData?.data.twitterUser.username}
                        </span>
                      </div>
                    </div>
                    <p className="mt-4 whitespace-pre-line">
                      {whitelistTweet.tweet}
                      <br />
                      <a
                        href="https://bitcoinbros.xyz"
                        className="text-blue-400"
                      >
                        bitcoinbros.xyz
                      </a>
                    </p>
                  </div>
                </>
              </>
            )
          : userData?.data?.isWhitelistPostShared && (
              <div className="py-4 px-8 mt-8 flex bg-[#CFFF50] items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Check fill="#18181b" />
                  <span className="font-medium text-zinc-900">
                    Tweeted your arrival!
                  </span>
                </div>
              </div>
            )}
      </section>
      <footer className="h-16 flex-shrink-0 relative"></footer>
      {(isLoadingAuth ||
        isLoadingFollow ||
        isLoadingPost ||
        isLoadingTwitterAuth ||
        isFetchingFollow ||
        isFetchingMe ||
        isFetchingTwitterAuth) && <Loading />}
    </main>
  );
};

export default Home;