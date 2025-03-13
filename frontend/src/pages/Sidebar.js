import "./Sidebar.css"

function Sidebar() {
  const menuItems = [
    { icon: "📊", label: "Dashboard", active: true },
    { icon: "🎯", label: "Takedown Tracker", hasSubmenu: true },
    { icon: "📈", label: "Insights & Analytics", hasSubmenu: true },
    { icon: "⚙️", label: "Settings", hasSubmenu: true },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img
          src="./setting.png"
          alt="Dashboard Logo"
          className="sidebar-logo"
        />
        <h2>
          Dashboard <span className="version">v1.0</span>
        </h2>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item, index) => (
          <div key={index} className={`nav-item ${item.active ? "active" : ""}`}>
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.hasSubmenu && <span className="submenu-arrow">›</span>}
          </div>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar

