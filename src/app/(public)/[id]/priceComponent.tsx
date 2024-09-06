export async function PriceComponent() {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return <p className="text-xl font-semibold mt-2">$2,999.99</p>;
}
