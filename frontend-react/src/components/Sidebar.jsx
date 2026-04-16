import { FaPlus, FaBook, FaHistory, FaSearch } from "react-icons/fa";

export default function Sidebar() {
  return (
    <div className="w-64 bg-white border-r p-5 flex flex-col justify-between">

      <div>
        <h2 className="text-xl font-bold mb-6 text-blue-600">
          🔬 Research AI
        </h2>

        <button className="flex items-center gap-2 bg-blue-100 p-2 rounded mb-4 w-full">
          <FaPlus /> New Chat
        </button>

        <div className="space-y-3 text-gray-600">
          <p className="flex items-center gap-2 cursor-pointer">
            <FaSearch /> Search
          </p>
          <p className="flex items-center gap-2 cursor-pointer">
            <FaBook /> Library
          </p>
          <p className="flex items-center gap-2 cursor-pointer">
            <FaHistory /> History
          </p>
        </div>
      </div>

      <button className="bg-blue-500 text-white p-2 rounded">
        Login
      </button>
    </div>
  );
}