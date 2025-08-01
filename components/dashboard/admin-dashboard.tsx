"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2 } from "lucide-react"
import { mockProducts } from "@/lib/mock-data"

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [products, setProducts] = useState(mockProducts)
  const [isAddingProduct, setIsAddingProduct] = useState(false)

  const tabs = [
    { id: "overview", name: "Overview" },
    { id: "products", name: "Products" },
    { id: "orders", name: "Orders" },
    { id: "inventory", name: "Inventory" },
  ]

  const stats = [
    { name: "Total Products", value: products.length, change: "+12%" },
    { name: "Total Orders", value: 156, change: "+23%" },
    { name: "Revenue", value: "$45,231", change: "+18%" },
    { name: "Low Stock Items", value: 8, change: "-5%" },
  ]

  const recentOrders = [
    { id: 1001, customer: "John Doe", total: 24999, status: "processing" },
    { id: 1002, customer: "Jane Smith", total: 8999, status: "shipped" },
    { id: 1003, customer: "Bob Johnson", total: 1299, status: "delivered" },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your store and monitor performance.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-64">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.name}
                  </Button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                  <Card key={stat.name}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                          <p className="text-2xl font-bold">{stat.value}</p>
                        </div>
                        <span className="text-sm text-green-600">{stat.change}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <p className="font-semibold">Order #{order.id}</p>
                          <p className="text-sm text-gray-600">{order.customer}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${order.total.toLocaleString()}</p>
                          <Badge variant={order.status === "delivered" ? "default" : "secondary"}>{order.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "products" && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Product Management</CardTitle>
                  <Button onClick={() => setIsAddingProduct(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isAddingProduct ? (
                  <div className="space-y-4 border rounded-lg p-4">
                    <h3 className="font-semibold">Add New Product</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Product Name</Label>
                        <Input id="name" placeholder="Enter product name" />
                      </div>
                      <div>
                        <Label htmlFor="price">Price</Label>
                        <Input id="price" type="number" placeholder="0.00" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" placeholder="Enter product description" />
                    </div>
                    <div className="flex gap-2">
                      <Button>Save Product</Button>
                      <Button variant="outline" onClick={() => setIsAddingProduct(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {products.slice(0, 10).map((product) => (
                      <div key={product.id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div>
                            <h3 className="font-semibold">{product.name}</h3>
                            <p className="text-sm text-gray-600">{product.category}</p>
                            <p className="font-medium">৳{product.price.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={product.inStock ? "default" : "secondary"}>
                            {product.inStock ? "In Stock" : "Out of Stock"}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "orders" && (
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <p className="font-semibold">Order #{order.id}</p>
                        <p className="text-sm text-gray-600">{order.customer}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold">${order.total.toLocaleString()}</span>
                        <Badge variant={order.status === "delivered" ? "default" : "secondary"}>{order.status}</Badge>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "inventory" && (
            <Card>
              <CardHeader>
                <CardTitle>Inventory Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products
                    .filter((p) => !p.inStock || Math.random() > 0.7)
                    .slice(0, 8)
                    .map((product) => (
                      <div key={product.id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <h3 className="font-semibold">{product.name}</h3>
                            <p className="text-sm text-gray-600">Current Stock: {Math.floor(Math.random() * 50)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input type="number" placeholder="Qty" className="w-20" />
                          <Button size="sm">Update</Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
