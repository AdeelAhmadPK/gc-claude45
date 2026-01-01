export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center space-y-8 px-4">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white">
            Work<span className="text-blue-600">OS</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Enterprise-grade work management platform that teams love to use
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <a
            href="/auth/signin"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
          >
            Get Started
          </a>
          <a
            href="/demo"
            className="px-8 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg"
          >
            View Demo
          </a>
        </div>

        <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-semibold text-lg mb-2">Real-time Collaboration</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Live updates across all users with instant synchronization
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-semibold text-lg mb-2">Flexible Boards</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Multiple views, custom columns, and powerful automation
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="font-semibold text-lg mb-2">AI-Powered</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Smart automation, risk detection, and intelligent suggestions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
