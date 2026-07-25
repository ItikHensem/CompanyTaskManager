import { useMemo } from 'react'
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
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useApp } from '../context/AppContext'
import { downloadBlob } from '../utils/files'

const COLORS = ['#0e6b5c', '#0c2744', '#a67c2d', '#175cd3', '#b42318']

export function Reports() {
  const { officers, tasks, submissions, getOfficer, addAudit } = useApp()

  const byType = [
    { name: 'Dalam', value: officers.filter((o) => o.type === 'dalam').length },
    { name: 'Luar', value: officers.filter((o) => o.type === 'luar').length },
  ]

  const byPriority = [
    { name: 'Tinggi', value: tasks.filter((t) => t.priority === 'tinggi').length },
    { name: 'Sederhana', value: tasks.filter((t) => t.priority === 'sederhana').length },
    { name: 'Rendah', value: tasks.filter((t) => t.priority === 'rendah').length },
  ]

  const byNegeri = useMemo(() => {
    const map: Record<string, number> = {}
    for (const t of tasks) {
      const key = t.negeri || 'Lain-lain'
      map[key] = (map[key] || 0) + 1
    }
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [tasks])

  const completionRate = tasks.length
    ? Math.round((tasks.filter((t) => t.status === 'selesai').length / tasks.length) * 100)
    : 0

  const accepted = submissions.filter((s) => s.status === 'diterima').length
  const acceptanceRate = submissions.length
    ? Math.round((accepted / submissions.length) * 100)
    : 0

  function exportExcel() {
    const rows = tasks.map((t) => ({
      Tajuk: t.title,
      Kategori: t.category,
      Negeri: t.negeri || '',
      Status: t.status,
      Keutamaan: t.priority,
      TarikhAkhir: t.dueDate,
      Pegawai: t.assignedTo.map((id) => getOfficer(id)?.name).filter(Boolean).join('; '),
      Ulang: t.recurrence,
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Tugasan')
    const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    downloadBlob('TaskEmployee-Laporan.xlsx', new Blob([out], { type: 'application/octet-stream' }))
    addAudit('EXPORT_EXCEL', 'Eksport laporan Excel')
  }

  function exportPdf() {
    const doc = new jsPDF()
    doc.setFontSize(14)
    doc.text('TaskEmployee — Laporan Tugasan JPNIN', 14, 16)
    doc.setFontSize(10)
    doc.text(`Dijana: ${new Date().toLocaleString('ms-MY')}`, 14, 22)
    autoTable(doc, {
      startY: 28,
      head: [['Tajuk', 'Negeri', 'Status', 'Keutamaan', 'Tarikh']],
      body: tasks.map((t) => [t.title, t.negeri || '—', t.status, t.priority, t.dueDate]),
      styles: { fontSize: 8 },
    })
    doc.save('TaskEmployee-Laporan.pdf')
    addAudit('EXPORT_PDF', 'Eksport laporan PDF')
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Laporan</h1>
          <p>Analisis prestasi agihan tugasan dan eksport untuk mesyuarat.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-secondary" onClick={exportExcel}>Export Excel</button>
          <button type="button" className="btn btn-primary" onClick={exportPdf}>Export PDF</button>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: '1rem' }}>
        <div className="stat">
          <div className="label">Kadar Penyiapan</div>
          <div className="value">{completionRate}%</div>
        </div>
        <div className="stat">
          <div className="label">Kadar Penerimaan</div>
          <div className="value">{acceptanceRate}%</div>
        </div>
        <div className="stat">
          <div className="label">Jumlah Tugasan</div>
          <div className="value">{tasks.length}</div>
        </div>
        <div className="stat">
          <div className="label">Jumlah Pegawai</div>
          <div className="value">{officers.length}</div>
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
          <div className="panel-title"><h2>Tugasan Mengikut Negeri</h2></div>
          <div style={{ height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={byNegeri}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d0d7e2" />
                <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={70} tick={{ fontSize: 10 }} />
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
