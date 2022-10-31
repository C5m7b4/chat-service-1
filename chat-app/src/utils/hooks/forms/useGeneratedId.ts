import { useMemo } from "react";

let seedCounter = 0;

const useGeneratedId = () => {
  const seed = useMemo(() => "id-" + seedCounter++, []);
  return (suffix: string) => `${seed}-${suffix}`;
};

export default useGeneratedId;
