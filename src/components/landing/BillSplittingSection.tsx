import { BillSplitter } from '../BillSplitter';

export function BillSplittingSection() {
  return (
    <section className="py-20 px-4 bg-muted/50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Quick Bill Splitter
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Try our smart bill splitter right here. Adjust individual amounts, lock values, 
            and watch the magic happen as everything balances automatically.
          </p>
        </div>
        <BillSplitter />
      </div>
    </section>
  );
}
