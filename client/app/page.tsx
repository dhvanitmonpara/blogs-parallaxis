"use client"

import { useEffect, useState } from "react";
import BlogCard from "./components/BlogCard";

type Blog = {
  id: string;
  title: string;
  content: string;
  image: string;
  author?: {
    id: string;
    email: string;
  };
};

export default function Home() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
        const endpoint = baseUrl
          ? `${baseUrl}/api/v1/blogs/get`
          : "/api/v1/blogs/get";

        const res = await fetch(endpoint, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch blogs (${res.status})`);
        }

        const data = (await res.json()) as Blog[];
        setBlogs(Array.isArray(data) ? data : []);
      } catch (error) {
        console.log(error);
        setBlogs([]);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to fetch blogs");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main className="m-8 text-zinc-100">
        <h1 className="mb-6 text-3xl font-semibold">Blogs</h1>
      {loading && <p className="text-zinc-300">Loading...</p>}
      {error && <p className="text-zinc-300">Error: {error}</p>}
      {!loading && !error && (
        <div className="flex flex-wrap justify-center gap-6">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
          {blogs.length === 0 && (
            <p className="text-zinc-400">No blogs found.</p>
          )}
        </div>
      )}
    </main>
  );
}
