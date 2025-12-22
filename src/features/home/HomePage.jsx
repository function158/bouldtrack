import StatsOverview from '../stats/StatsOverview'

export default function HomePage({ user }) {
  return (
    <div style={{ padding: 16 }}>
      <StatsOverview user={user} />
    </div>
  )
}
