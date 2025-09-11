// app/page.jsx (Next.js 13+)
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <section className="relative min-h-screen flex flex-col justify-center items-center text-white overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="/professional-safeguards-team-work.jpg"
            alt="Professional Security Team"
            fill
            style={{ objectFit: "cover", objectPosition: "center" }}
            priority
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-purple-900 opacity-80"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 drop-shadow-lg">
            Smart Security Guard Management
          </h1>
          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto drop-shadow-md">
            Manage shifts, posts, and rosters efficiently with our automated
            system. Keep your team organized and ensure safety at every post.
          </p>
          <div className="flex justify-center mt-10 gap-6">
            <Link
              href={"/Login"}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300"
            >
              Login
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
