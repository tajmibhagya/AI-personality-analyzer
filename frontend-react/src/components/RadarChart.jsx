import { Radar, RadarChart, PolarGrid, PolarAngleAxis } from "recharts";

export default function PersonalityRadar({ data }) {
  return (
    <RadarChart outerRadius={150} width={400} height={300} data={data}>
      <PolarGrid />
      <PolarAngleAxis dataKey="trait" />
      <Radar dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
    </RadarChart>
  );
}