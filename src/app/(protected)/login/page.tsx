import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const revalidate = 30;

export default function Login() {
  async function login() {
    "use server";
    const coo = cookies();
    coo.set("token", "admin", {
      path: "/",
      sameSite: "strict",
      secure: true,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    });
    coo.set("otherThing", "otherValue", {
      path: "/",
      sameSite: "strict",
      expires: new Date(Date.now() + 1000 * 60),
    });
    redirect("/dashboard");
  }
  return (
    <div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white flex items-center justify-center min-h-screen">
      <div className="w-full max-w-sm p-8 bg-white dark:bg-zinc-800 shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold text-center text-indigo-500 dark:text-white mb-6">
          Admin Login
        </h1>
        <h2 className="text-lg text-center mb-6">
          Time : {new Date().toLocaleTimeString()}
        </h2>
        <form action={login}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-lg mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-700"
              placeholder="Enter your username"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-lg mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-700"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-lg transition duration-300"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}
