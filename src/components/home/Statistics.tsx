import { motion } from 'framer-motion';

interface StatisticsProps {
  statistics: Array<{
    id: number | string;
    name: string;
    value: string;
  }>;
}

const MAX_PER_ROW = 5;

const Statistics = ({ statistics }: StatisticsProps) => {
  const rows: typeof statistics[] = [];
  for (let i = 0; i < statistics.length; i += MAX_PER_ROW) {
    rows.push(statistics.slice(i, i + MAX_PER_ROW));
  }

  return (
    <div className="mt-8 sm:mt-12 w-full px-4 md:px-20 lg:px-32 space-y-6 md:space-y-8">
      {/* Mobile: grid 2 kolom */}
      <div className="block lg:hidden grid grid-cols-2 gap-4">
        {statistics.map((stat, index) => (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white shadow-md rounded-xl p-4 text-center"
          >
            <div className="text-2xl font-bold text-blue-900">{stat.value}</div>
            <div className="mt-1 text-sm text-gray-600">{stat.name}</div>
          </motion.div>
        ))}
      </div>

      {/* Desktop: rata kiri-kanan, maks 5 per baris */}
      <div className="hidden lg:block space-y-8">
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="w-full flex flex-row justify-between items-stretch gap-4"
          >
            {row.map((stat, index) => (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (rowIndex * MAX_PER_ROW + index) * 0.1 }}
                className="flex-1 min-w-0 flex flex-col items-center justify-center text-center"
              >
                <div className="text-4xl font-bold text-blue-900">{stat.value}</div>
                <div className="mt-1 text-base text-gray-600">{stat.name}</div>
              </motion.div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Statistics;
