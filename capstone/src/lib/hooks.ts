import { useMemo } from 'react';
import { allSeries, summarize } from './analysis';
import { useData } from './store';

export function useSeries() {
  const { data, tests } = useData();
  return useMemo(() => {
    const series = allSeries(tests, data.results);
    return { series, summary: summarize(series) };
  }, [tests, data.results]);
}
