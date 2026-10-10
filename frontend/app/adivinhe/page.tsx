import { AdivinheClient } from "./AdivinheClient";

type SearchParams = { seed?: string };

export default async function AdivinhePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const seedRaw = params.seed;
  const seed =
    seedRaw !== undefined && /^\d+$/.test(seedRaw) ? Number(seedRaw) : undefined;
  return <AdivinheClient seedInicial={seed} />;
}
