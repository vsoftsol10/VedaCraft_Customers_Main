import ProductCard from './ProductCard';
export default function ProductSection({ title, products }) {
    return (<section className="py-8">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <h2 className="text-xl font-bold text-gray-800 mb-5">{title}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {products.map((product) => (<ProductCard key={product.id} product={product}/>))}
        </div>
      </div>
    </section>);
}
