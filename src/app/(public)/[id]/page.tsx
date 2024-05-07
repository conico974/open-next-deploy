import Image from "next/image";
import Link from "next/link";

export default function Page() {
  return (
    <main>
      <nav className="bg-white dark:bg-zinc-800 shadow-md py-4">
        <div className="container mx-auto px-4 text-center">
          <Link
            href="/"
            className="text-2xl font-bold text-indigo-500 dark:text-white"
          >
            Timeless Luxury Watches
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4">
        <section className="flex flex-wrap md:flex-nowrap items-center py-16">
          <Image
            src="/watch/watch1.jpg"
            alt="Luxury Watch"
            width={600}
            height={400}
            className="md:w-1/2 w-full h-auto"
          />
          <div className="md:w-1/2 w-full md:pl-8 mt-4 md:mt-0">
            <h1 className="text-5xl font-bold">Classic Gold</h1>
            <p className="text-xl font-semibold mt-2">$2,999.99</p>
            <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg mt-4 transition duration-300">
              Buy Now
            </button>
          </div>
        </section>

        <section className="py-8">
          <div className="flex flex-wrap md:flex-nowrap items-center">
            <div className="md:w-1/2 w-full md:order-2">
              <Image
                src="/watch/watch2.jpg"
                alt="Luxury Watch"
                width={600}
                height={400}
                className="w-full h-auto"
              />
            </div>
            <div className="md:w-1/2 w-full md:pr-8 md:order-1">
              <h2 className="text-3xl font-bold">Elegant Design</h2>
              <p className="mt-4">
                Our Classic Gold watch features an elegant design with a
                luxurious gold finish that complements any outfit.
              </p>
            </div>
          </div>
        </section>

        <section className="py-8 bg-zinc-100 dark:bg-zinc-800">
          <div className="flex flex-wrap md:flex-nowrap items-center">
            <div className="md:w-1/2 w-full">
              <Image
                src="/watch/watch3.jpg"
                alt="Luxury Watch"
                width={600}
                height={400}
                className="w-full h-auto"
              />
            </div>
            <div className="md:w-1/2 w-full md:pl-8">
              <h2 className="text-3xl font-bold">Advanced Features</h2>
              <p className="mt-4">
                Experience advanced features like waterproof technology and an
                anti-scratch sapphire crystal face.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
