import ProductCard from './ProductCard';

export default function ProductSection({ title, products }) {
  return (
    <section className="py-6 sm:py-8">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">{title}</h2>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-3 pt-1">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

