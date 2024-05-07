export default function Page() {
  return (
    <section className="flex flex-wrap md:flex-nowrap items-center py-16">
      <div className="md:w-1/3 w-full p-4">
        <div className="bg-white dark:bg-zinc-800 shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold">Orders</h2>
          <p className="mt-2">Manage all your customer orders here.</p>
          <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg mt-4 transition duration-300">
            View Orders
          </button>
        </div>
      </div>
      <div className="md:w-1/3 w-full p-4">
        <div className="bg-white dark:bg-zinc-800 shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold">Products</h2>
          <p className="mt-2">Add, remove or edit your product listings.</p>
          <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg mt-4 transition duration-300">
            Manage Products
          </button>
        </div>
      </div>
      <div className="md:w-1/3 w-full p-4">
        <div className="bg-white dark:bg-zinc-800 shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold">Analytics</h2>
          <p className="mt-2">View detailed analytics and insights.</p>
          <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg mt-4 transition duration-300">
            View Analytics
          </button>
        </div>
      </div>
    </section>
  );
}
