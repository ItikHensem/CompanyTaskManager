import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useApp } from '../context/AppContext'

const COLORS = ['#0e6b5c', '#0c2744', '#a67c2d', '#175cd3', '#b42318']

export function Reports() {
  const { officers, tasks, submissions } = useApp()

  const byType = [
    { name: 'Dalam', value: officers.filter((o) => o.type === 'dalam').length },
    { name: 'Luar', value: officers.filter((o) => o.type === 'luar').length },
  ]

  const byPriority = [
    { name: 'Tinggi', value: tasks.filter((t) => t.priority === 'tinggi').length },
    { name: 'Sederhana', value: tasks.filter((t) => t.priority === 'sederhana').length },
    { name: 'Rendah', value: tasks.filter((t) => t.priority === 'rendah').length },
  ]

  const byCategoryMap = tasks.reduce<Record<string, number>>((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1
    return acc
  }, {})
  const byCategory = Object.entries(byCategoryMap).map(([name, value]) => ({ name, value }))

  const completionRate = tasks.length
    ? Math.round((tasks.filter((t) => t.status === 'selesai').length / tasks.length) * 100)
    : 0

  const accepted = submissions.filter((s) => s.status === 'diterima').length
  const acceptanceRate = submissions.length
    ? Math.round((accepted / submissions.length) * 100)
    : 0

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Laporan</h1>
          <p>Analisis prestasi agihan tugasan dan penglibatan pegawai.</p>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: '1rem' }}>
        <div className="stat">
          <div className="label">Kadar Penyiapan</div>
          <div className="value">{completionRate}%</div>
          <div className="hint">tugasan selesai</div>
        </div>
        <div className="stat">
          <div className="label">Kadar Penerimaan</div>
          <div className="value">{acceptanceRate}%</div>
          <div className="hint">serahan diterima</div>
        </div>
        <div className="stat">
          <div className="label">Jumlah Tugasan</div>
          <div className="value">{tasks.length}</div>
          <div className="hint">semua kategori</div>
        </div>
        <div className="stat">
          <div className="label">Jumlah Pegawai</div>
          <div className="value">{officers.length}</div>
          <div className="hint">dalam & luar</div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="panel">
          <div className="panel-title"><h2>Pegawai Mengikut Jenis</h2></div>
          <div style={{ height: 280 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={byType} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={3}>
                  {byType.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <div className="panel-title"><h2>Tugasan Mengikut Keutamaan</h2></div>
          <div style={{ height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={byPriority}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d0d7e2" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {byPriority.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel" style={{ gridColumn: '1 / -1' }}>
          <div className="panel-title"><h2>Tugasan Mengikut Kategori</h2></div>
          <div style={{ height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={byCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d0d7e2" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#0c2744" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
