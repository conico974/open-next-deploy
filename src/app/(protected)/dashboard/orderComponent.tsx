export async function OrderComponent() {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return (
    <>
      <p className="mt-2">Manage all your customer orders here.</p>
      <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg mt-4 transition duration-300">
        View Orders
      </button>
    </>
  );
}
