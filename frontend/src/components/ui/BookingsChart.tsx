import { type ChartConfig, ChartContainer } from '@/components/ui/chart';
import { Area, CartesianGrid, XAxis, YAxis, Tooltip, Line, ComposedChart } from 'recharts';

interface BookingData {
  date: string;
  bookings: number;
  target?: number;
}

interface BookingsChartProps {
  data: BookingData[];
  title?: string;
}

interface TooltipPayload {
  value: number;
  dataKey: string;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg px-3 py-2">
        <p className="text-[var(--text-secondary)] text-xs mb-1">{label}</p>
        {payload.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-2 h-2 rounded-sm" 
              style={{ backgroundColor: item.dataKey === 'bookings' ? 'var(--primary)' : 'var(--success)' }}
            ></div>
            <span className="text-[var(--text-primary)]">
              {item.dataKey === 'bookings' ? 'Bookings' : 'Target'}: {item.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const chartConfig = {
  bookings: {
    label: 'Bookings',
    color: 'var(--primary)',
  },
  target: {
    label: 'Target',
    color: 'var(--success)',
  },
} satisfies ChartConfig;

export function BookingsChart({ data, title = "Bookings Overview" }: BookingsChartProps) {
  // Add varying target data (not flat line, more realistic goals)
  const dataWithTarget = data.map((d, index) => {
    // Create varying targets that trend upward
    const baseTarget = 2;
    const variation = [1, 2, 1, 3, 2, 4, 3]; // varying goals per day
    const target = baseTarget + (variation[index % variation.length] || 0);
    return { ...d, target };
  });

  return (
    <div className="bg-[var(--surface)] rounded-2xl p-6 w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-[var(--text-primary)]">{title}</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)]"></div>
            <span className="text-[var(--text-secondary)]">Bookings</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 border-t-2 border-dashed border-[var(--success)]"></div>
            <span className="text-[var(--text-secondary)]">Target</span>
          </div>
        </div>
      </div>
      <ChartContainer config={chartConfig} className="h-[350px] w-full !aspect-auto">
        <ComposedChart
          data={dataWithTarget}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <defs>
            <linearGradient id="bookingsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="4 4"
            stroke="#374151"
            strokeOpacity={0.3}
            horizontal={true}
            vertical={false}
          />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            dy={5}
            tickMargin={12}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickMargin={12}
            allowDecimals={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{
              stroke: '#374151',
              strokeWidth: 1,
            }}
          />
          {/* Target line (dotted) - using success color */}
          <Line
            type="monotone"
            dataKey="target"
            stroke="var(--success)"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            activeDot={false}
          />
          {/* Bookings area with gradient */}
          <Area
            type="monotone"
            dataKey="bookings"
            stroke="var(--primary)"
            strokeWidth={2}
            fill="url(#bookingsGradient)"
            dot={{
              fill: 'var(--background)',
              strokeWidth: 2,
              r: 4,
              stroke: 'var(--primary)',
            }}
            activeDot={{
              fill: 'var(--primary)',
              strokeWidth: 2,
              r: 6,
              stroke: 'var(--background)',
            }}
          />
        </ComposedChart>
      </ChartContainer>
    </div>
  );
}
