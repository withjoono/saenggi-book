"use client";

export const SkeletonOne = () => {
  return (
    <div className="relative flex h-full gap-10 p-8">
      <div className="absolute inset-0 flex flex-col gap-4">
        <div className="r z-20 mx-auto h-[250px] w-[450px] flex-shrink-0 rounded-[32px] border border-neutral-200 bg-neutral-100 p-2 transition duration-200 group-hover:scale-[1.02] dark:border-neutral-700 dark:bg-neutral-800 md:h-[309px] md:w-[550px]">
          <div className="h-full flex-shrink-0 rounded-[24px] border border-neutral-200 bg-white p-2 dark:border-neutral-700 dark:bg-black">
            <img
              src="/images/intro-susi-1.png"
              alt="header"
              width={1920}
              height={1080}
              className="h-full w-full flex-shrink-0 rounded-[20px] object-cover"
              style={{ aspectRatio: "16/9" }}
            />
          </div>
        </div>
        <div className="r z-20 mx-auto h-[250px] w-[450px] flex-shrink-0 rounded-[32px] border border-neutral-200 bg-neutral-100 p-2 transition duration-200 group-hover:scale-[1.02] dark:border-neutral-700 dark:bg-neutral-800 md:h-[309px] md:w-[550px]">
          <div className="h-full flex-shrink-0 rounded-[24px] border border-neutral-200 bg-white p-2 dark:border-neutral-700 dark:bg-black">
            <img
              src="/images/intro-jungsi-1.png"
              alt="header"
              width={1920}
              height={1080}
              className="h-full w-full flex-shrink-0 rounded-[20px] object-cover"
              style={{ aspectRatio: "16/9" }}
            />
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-60 w-full bg-gradient-to-t from-white via-white to-transparent dark:from-black dark:via-black" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-40 h-60 w-full bg-gradient-to-b from-white via-transparent to-transparent dark:from-black" />
    </div>
  );
};
