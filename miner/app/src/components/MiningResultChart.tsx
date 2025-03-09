import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export type MiningChartData = {
  idx: number;
  label: string;
  wasm: number;
  js: number;
};

export interface MiningChartProps {
  data: MiningChartData[];
}

export default function MiningResultChart({ data }: MiningChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <Line type="monotone" dataKey="wasm" stroke="#8884d8" />
        <Line type="monotone" dataKey="js" stroke="#82ca9d" />
        <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
        <XAxis dataKey="idx" />
        <YAxis />
        <Tooltip />
      </LineChart>
    </ResponsiveContainer>
  );
}
