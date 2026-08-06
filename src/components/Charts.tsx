import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Card } from './ui';

const COLORS = ['#5D2E46', '#B5838D', '#8B5E6E', '#D4A5AE', '#3D1E2E', '#E8C4C8'];

export function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <div className="mb-4">
        <h3 className="font-semibold text-ink">{title}</h3>
        {subtitle && <p className="mt-0.5 text-sm text-ink-muted">{subtitle}</p>}
      </div>
      <div className="h-64 w-full">{children}</div>
    </Card>
  );
}

export function SimpleAreaChart({
  data,
  dataKey,
  xKey = 'name',
}: {
  data: Record<string, string | number>[];
  dataKey: string;
  xKey?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="fillPrimary" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5D2E46" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#5D2E46" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e7e0e3" />
        <XAxis dataKey={xKey} tick={{ fontSize: 12 }} stroke="#8a7a82" />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#8a7a82" />
        <Tooltip />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke="#5D2E46"
          fill="url(#fillPrimary)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function SimpleBarChart({
  data,
  dataKey,
  xKey = 'name',
}: {
  data: Record<string, string | number>[];
  dataKey: string;
  xKey?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e7e0e3" />
        <XAxis dataKey={xKey} tick={{ fontSize: 12 }} stroke="#8a7a82" />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#8a7a82" />
        <Tooltip />
        <Bar dataKey={dataKey} fill="#5D2E46" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SimplePieChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
