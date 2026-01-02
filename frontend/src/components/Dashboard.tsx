import EnvCard from "./cards/EnvCard";
import PodCard from "./cards/PodCard";

type Props = {
  fileName: string;
};

export default function Dashboard({ fileName }: Props) {
  return (
    <>
      <EnvCard fileName={fileName} />
      <PodCard fileName={fileName} />
    </>
  );
}
