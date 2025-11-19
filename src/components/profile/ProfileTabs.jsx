const ProfileTabs = ({ tabs, activeTab, onTabChange, onKeyDown }) => {
  return (
    <nav
      className="flex flex-col space-y-2"
      role="tablist"
      aria-orientation="vertical"
      aria-label="Profile sections"
    >
      {tabs.map((tab, idx) => (
        <button
          key={tab.id}
          id={`tab-${tab.id}`}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`panel-${tab.id}`}
          tabIndex={activeTab === tab.id ? 0 : -1}
          onClick={() => onTabChange(tab.id)}
          onKeyDown={(e) => onKeyDown(e, idx)}
          className={`w-full text-left px-4 py-3 text-md font-medium rounded-md transition-colors focus:outline-none hover:cursor-pointer ${
            activeTab === tab.id
              ? "bg-green-50 border border-green-200 text-green-800"
              : "text-gray-700 hover:bg-gray-50 hover:border hover:border-gray-200"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
};

export default ProfileTabs;