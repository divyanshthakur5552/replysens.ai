import { type ChartConfig, ChartContainer } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface ServiceData {
  name: string;
  count: number;
}

interface ServicesBarChartProps {
  data: ServiceData[];
  title?: string;
}

interface TooltipPayload {
  value: number;
  payload: { name: string; count: number };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg px-3 py-2">
        <p className="text-[var(--text-primary)] font-medium text-sm">{payload[0].payload.name}</p>
        <p className="text-[var(--text-secondary)] text-sm">{payload[0].value} bookings</p>
      </div>
    );
  }
  return null;
};

const chartColors = ['#FF477E', '#FF7096', '#FF99AC', '#F9BEC7'];

const chartConfig = {
  count: {
    label: 'Bookings',
    color: '#2dd4bf',
  },
} satisfies ChartConfig;

export function ServicesBarChart({ data, title = "Services Breakdown" }: ServicesBarChartProps) {
  return (
    <div className="bg-[var(--surface)] rounded-2xl p-6">
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4 text-center">{title}</h3>
      <ChartContainer config={chartConfig} className="h-[150px] w-full">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <XAxis 
            type="number" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
          />
          <YAxis 
            type="category" 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
            width={70}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar 
            dataKey="count" 
            radius={[0, 6, 6, 0]}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}
