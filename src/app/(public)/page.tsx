import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto px-4">
      <div className="h-screen flex flex-col justify-center items-center bg-indigo-500 text-white">
        <h1 className="text-5xl font-bold mb-4">Discover Timeless Luxury</h1>
        <p className="text-xl mb-8">
          Explore our exclusive collection of luxury watches.
        </p>
        <a
          href="#shop"
          className="bg-white text-indigo-500 px-8 py-3 rounded-lg font-semibold hover:bg-zinc-200 transition duration-300"
        >
          Shop Now
        </a>
      </div>

      <section id="shop" className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Featured Watches
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Link
            href="/classic-gold"
            className="bg-white dark:bg-zinc-800 shadow-lg rounded-lg overflow-hidden"
          >
            <Image
              src="/watch/watch1.jpg"
              alt="Luxury Watch"
              width={600}
              height={400}
              className="w-full"
            />
            <div className="p-8">
              <h3 className="text-2xl font-semibold">Classic Gold</h3>
              <p className="text-zinc-600 dark:text-zinc-400 mt-2">
                A timeless design with a touch of modern elegance.
              </p>
              <div className="mt-4">
                <span className="text-lg font-bold">$2,999.99</span>
              </div>
            </div>
          </Link>
          <Link
            href="/silver-sleek"
            className="bg-white dark:bg-zinc-800 shadow-lg rounded-lg overflow-hidden"
          >
            <Image
              src="/watch/watch2.jpg"
              alt="Luxury Watch"
              width={600}
              height={400}
              className=" w-full "
            />
            <div className="p-8">
              <h3 className="text-2xl font-semibold">Silver Sleek</h3>
              <p className="text-zinc-600 dark:text-zinc-400 mt-2">
                Elegantly crafted to complement your style.
              </p>
              <div className="mt-4">
                <span className="text-lg font-bold">$1,450.00</span>
              </div>
            </div>
          </Link>
          <div className="bg-white dark:bg-zinc-800 shadow-lg rounded-lg overflow-hidden">
            <Image
              src="/watch/watch3.jpg"
              alt="Luxury Watch"
              width={600}
              height={400}
              className="w-full h-auto"
            />
            <div className="p-8">
              <h3 className="text-2xl font-semibold">Modern Black</h3>
              <p className="text-zinc-600 dark:text-zinc-400 mt-2">
                A bold choice for those who dare to be different.
              </p>
              <div className="mt-4">
                <span className="text-lg font-bold">$3,250.00</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
