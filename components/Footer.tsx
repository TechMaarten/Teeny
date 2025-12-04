// developers: Victoria Mulugeta, Maarten Lopes
export default function Footer() {
  return (
    <footer className="bg-[#1F2937] text-gray-300 text-center py-4 text-sm">
      <p>
        {/* Footer link */}
        Built by Victoria, Zach, Nathan, and Maarten •{" "}
        <a href="#" className="text-[#3B82F6] hover:underline">Credits</a> &copy; {new Date().getFullYear()}
      </p>
    </footer>
  );
}
