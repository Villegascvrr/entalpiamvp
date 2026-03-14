import { Category } from "@/data/types";
import { CategoryCard } from "./CategoryCard";

interface CategoryGridProps {
  categories: Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 grid-rows-2 gap-4 lg:gap-6 h-full max-w-[880px]">
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} className="max-w-[420px] w-full" />
      ))}
    </div>
  );
}
