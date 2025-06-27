import { type PageProps } from "fresh";
import { Partial } from "fresh/runtime";
import { Nav } from "@/islands/nav.tsx";

export default function Layout(ctx: PageProps) {
  const pathname = new URL(ctx.req.url).pathname;

  return (
    <div className="flex flex-col justify-start min-h-screen">
      <div class="border-b pl-4 gap-4 flex flex-row justify-between items-center h-14 sticky top-0 bg-white dark:bg-gray-900">
        <div class="font-bold tracking-widest flex-shrink-0">
          <a
            class="no-underline flex flex-row justify-start items-center gap-1"
            href="/"
          >
            <img
              src="/mark.png"
              alt="Mark"
              class="w-6 h-6 dark:invert"
              width="24"
              height="24"
            />
          </a>
        </div>

        <Nav pathname={pathname} />
      </div>

      <div className="flex flex-col flex-1 justify-between my-6 sm:w-[90%] px-4 md:max-w-6xl md:mx-auto overflow-x-hidden">
        <Partial name="overlay-content">
          <ctx.Component />
        </Partial>
      </div>
      <footer class="border-t flex flex-row items-center tracking-wide justify-center gap-1 h-14">
        <div className="w-full inline text-right">
          <a href="https://github.com/jacobheric/mark">Made</a> with
        </div>
        <div className="text-xl">&#9829;</div>
        <div className="flex flex-row justify-start w-full">in Maine</div>
      </footer>
    </div>
  );
}
