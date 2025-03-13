import "./StatsCard.css"

function StatsCards({ stats }) {
  return (
    <div className="stats-container">
      {stats.map((stat, index) => (
        <div key={index} className="stat-card">
          <h3>{stat.title}</h3>
          <p className="stat-value">{stat.value}</p>
        </div>
      ))}
    </div>
  )
}

export default StatsCards

