import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  async function logout() {
    "use server";
    const coo = cookies();
    coo.delete("token");
    redirect("/login");
  }
  return (
    <div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white flex">
      <nav className="bg-white dark:bg-zinc-800 shadow-md w-64 min-h-screen py-4 flex flex-col justify-between">
        <div>
          <div className="px-4 mb-10 text-center">
            <a
              href="#"
              className="text-2xl font-bold text-indigo-500 dark:text-white"
            >
              TLW - Admin
            </a>
          </div>
          <ul className="space-y-2">
            <li>
              <a
                href="#"
                className="block px-4 py-2 text-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition duration-300"
              >
                Orders
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block px-4 py-2 text-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition duration-300"
              >
                Products
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block px-4 py-2 text-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition duration-300"
              >
                Analytics
              </a>
            </li>
          </ul>
        </div>
        <form action={logout} className="px-4 pb-4 text-center">
          <button
            type="submit"
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition duration-300"
          >
            Disconnect
          </button>
        </form>
      </nav>
      <main className="flex-1">{children}</main>
    </div>
  );
}
