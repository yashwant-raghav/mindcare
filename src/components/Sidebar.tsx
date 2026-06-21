import { 
  Smile, BookOpen, Music, Activity, 
  Compass, User, LogOut, MessageSquareHeart, X 
} from "lucide-react";
import { User as UserType } from "../types";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserType;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, user, onLogout, isOpen, onClose }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Compass },
    { id: "mood", label: "Mood Journey", icon: Smile },
    { id: "journal", label: "My Journal", icon: BookOpen },
    { id: "music", label: "Sonic Sanctuary", icon: Music },
    { id: "exercises", label: "Mindful Motion", icon: Activity },
    { id: "chat", label: "AI CBT Companion", icon: MessageSquareHeart },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <aside 
      className={`w-64 bg-white border-r border-gray-200 flex flex-col justify-between h-screen transition-transform duration-300 ease-in-out z-50 
        ${isOpen ? "translate-x-0 shadow-xl" : "-translate-x-full lg:translate-x-0"} 
        fixed top-0 left-0 lg:sticky lg:top-0 lg:flex`} 
      id="app-sidebar"
    >
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Compass className="w-5.5 h-5.5" />
            </div>
            <div>
              <h1 className="text-sm font-bold font-display text-gray-900 tracking-tight">MindCare</h1>
              <p className="text-[10px] font-mono text-blue-600 font-semibold tracking-wider uppercase">Serene Clarity</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {user.isPro && (
              <span className="text-[9px] font-mono bg-blue-50 border border-blue-200 text-blue-700 px-1.5 py-0.5 rounded-md font-semibold">
                PRO
              </span>
            )}
            <button 
              onClick={onClose}
              className="lg:hidden p-1 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              title="Close Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="p-4 space-y-1" id="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-gray-500 hover:bg-gray-50 hover:text-blue-600"
                }`}
                id={`sidebar-item-${item.id}`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-400 group-hover:text-blue-500"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-200 space-y-4">
        <div className="flex items-center space-x-3 px-2">
          <img
            src={user.avatar}
            alt={user.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop";
            }}
            className="w-9 h-9 rounded-full object-cover border border-gray-200"
          />
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-gray-900 truncate">{user.name}</h4>
            <p className="text-[9px] font-mono text-gray-400 truncate">{user.email}</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50/60 transition-colors"
          id="btn-sidebar-logout"
        >
          <LogOut className="w-4 h-4 text-red-600" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
