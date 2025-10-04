const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="bg-white/80 rounded-xl shadow-2xl p-8 text-center max-w-md w-full">
        <img
          src="/illustrations/travel.jpg"
          alt="Not Found Illustration"
          className="mx-auto mb-6 w-40 h-40 object-cover rounded-lg shadow-lg border"
        />
        <h1 className="text-6xl font-extrabold text-purple-600 mb-2 tracking-tight drop-shadow">
          404
        </h1>
        <p className="text-2xl text-gray-700 mb-4 font-semibold">
          Oops! Page not found
        </p>
        <p className="text-base text-gray-500 mb-6">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold shadow hover:scale-105 transition-transform duration-150"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
