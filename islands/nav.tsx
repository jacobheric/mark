import { useEffect, useRef, useState } from "preact/hooks";

export const Nav = ({ pathname }: { pathname: string }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const clickAway = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", clickAway);
    return () => {
      document.removeEventListener("mousedown", clickAway);
    };
  }, [dropdownRef]);

  return (
    <div
      ref={dropdownRef}
      class="relative flex flex-row items-center"
      onClick={() => setShowDropdown(!showDropdown)}
    >
      <div class="flex flex-col items-center justify-center w-10 h-4 rounded cursor-pointer">
        <span class="block w-5 h-0.5 mb-1 dark:bg-white bg-gray-900"></span>
        <span class="block w-5 h-0.5 mb-1 dark:bg-white bg-gray-900"></span>
        <span class="block w-5 h-0.5 dark:bg-white bg-gray-900"></span>
      </div>

      {showDropdown && (
        <div class="absolute top-8 right-2 rounded w-32 border bg-white dark:bg-gray-900 z-10 shadow-md">
          <a
            href="/"
            class="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 no-underline"
          >
            Home
          </a>
          {pathname !== "/pocket/import" && (
            <a
              href="/pocket/import"
              class="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 no-underline"
            >
              Import
            </a>
          )}
          {pathname !== "/mark" && (
            <a
              href="/mark"
              class="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 no-underline"
            >
              Mark
            </a>
          )}
          {pathname !== "/tags" && (
            <a
              href="/tags"
              class="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 no-underline"
            >
              Tags
            </a>
          )}
        </div>
      )}
    </div>
  );
};
