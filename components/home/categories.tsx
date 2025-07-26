import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

const categories = [
  {
    id: "manufacturing",
    name: "Manufacturing Automation",
    description: "Industrial robots for production lines",
    image: "/placeholder.svg?height=200&width=300",
    count: 28,
  },
  {
    id: "warehouse",
    name: "Warehouse & Logistics",
    description: "Automated material handling solutions",
    image: "/placeholder.svg?height=200&width=300",
    count: 22,
  },
  {
    id: "office",
    name: "Office Automation",
    description: "Service robots for workplace efficiency",
    image: "/placeholder.svg?height=200&width=300",
    count: 18,
  },
  {
    id: "healthcare",
    name: "Healthcare & Lab",
    description: "Medical and laboratory automation",
    image: "/placeholder.svg?height=200&width=300",
    count: 15,
  },
]

export function Categories() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Product Categories</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our comprehensive range of robotics solutions across different industries and applications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link key={category.id} href={`/products?category=${category.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <img
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                  <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{category.description}</p>
                  <p className="text-blue-600 font-medium">{category.count} products</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
