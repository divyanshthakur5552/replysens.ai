import { type ChartConfig, ChartContainer } from '@/components/ui/chart';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

interface StatusData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface StatusDonutChartProps {
  data: StatusData[];
  title?: string;
}

interface TooltipPayload {
  value: number;
  payload: { name: string; value: number };
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

const chartConfig = {
  value: {
    label: 'Count',
  },
} satisfies ChartConfig;

export function StatusDonutChart({ data, title = "Status Breakdown" }: StatusDonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-[var(--surface)] rounded-2xl p-6">
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4 text-center">{title}</h3>
      <div className="flex items-center justify-center gap-6">
        <ChartContainer config={chartConfig} className="h-[120px] w-[120px]">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={55}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ChartContainer>
        
        <div className="flex flex-col gap-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[var(--text-secondary)] text-sm">{item.name}</span>
              <span className="text-[var(--text-primary)] font-medium text-sm ml-1">
                {item.value} ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
