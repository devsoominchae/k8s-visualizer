import EnvCard from "./cards/EnvCard";

type Props = {
  fileName: string;
};

export default function Dashboard({ fileName }: Props) {
  return (
    <>
      <EnvCard fileName={fileName} />
    </>
  );
}
