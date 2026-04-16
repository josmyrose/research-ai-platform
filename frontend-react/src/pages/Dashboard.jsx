import Sidebar from "../components/Sidebar";
import ChatBox from "../components/ChatBox";

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <ChatBox />
    </div>
  );
}