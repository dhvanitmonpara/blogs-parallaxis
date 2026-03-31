type BlogCardProps = {
  blog: {
    title: string;
    content: string;
    image: string;
    author?: {
      email: string;
    };
  };
};

function BlogCard({ blog }: BlogCardProps) {
  return (
    <article className="w-full max-w-sm overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
      <img
        src={blog.image}
        alt={blog.title}
        className="h-48 w-full object-cover"
      />
      <div className="space-y-3 p-5">
        <h2 className="text-xl font-semibold text-zinc-100">{blog.title}</h2>
        <p className="line-clamp-4 text-sm text-zinc-300">{blog.content}</p>
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
          {blog.author?.email ?? "Unknown author"}
        </p>
      </div>
    </article>
  );
}

export default BlogCard;
