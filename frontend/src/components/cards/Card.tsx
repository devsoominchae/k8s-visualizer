import { Card as RadixCard } from "@radix-ui/themes";

type Props = {
  children: React.ReactNode;
};

export default function Card({ children }: Props) {
  return <RadixCard size="3">{children}</RadixCard>;
}
