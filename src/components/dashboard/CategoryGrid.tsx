import { Category } from "@/data/types";
import { CategoryCard } from "./CategoryCard";

interface CategoryGridProps {
  categories: Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 h-full auto-rows-[minmax(200px,1fr)]">
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
}
