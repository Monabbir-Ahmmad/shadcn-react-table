/** Examples grouped by category (first-seen order), for the home page. */
export function exampleCategories(
  examples: { slug: string; title: string; category: string }[]
) {
  const groups = new Map<
    string,
    { category: string; count: number; titles: string[] }
  >()
  for (const example of examples) {
    const group = groups.get(example.category) ?? {
      category: example.category,
      count: 0,
      titles: [],
    }
    group.count++
    if (group.titles.length < 3) group.titles.push(example.title)
    groups.set(example.category, group)
  }
  return [...groups.values()]
}
