"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Eye, Package, Truck } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Order {
  order_id: number
  user_name?: string
  user_email?: string
  order_date: string
  total_amount: number
  payment_status: string
  shipping_status: string
}

export function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders")
      const data = await response.json()
      setOrders(data.orders)
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update order status")
      }

      setOrders(orders.map((order) => (order.order_id === orderId ? { ...order, shipping_status: newStatus } : order)))

      toast({
        title: "Success",
        description: "Order status updated successfully",
      })
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "shipped":
        return "bg-blue-100 text-blue-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "returned":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading orders...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No orders found</p>
            ) : (
              orders.map((order) => (
                <div key={order.order_id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">Order #{order.order_id}</h3>
                      <p className="text-sm text-gray-600">
                        {order.user_name || "Unknown Customer"} • {new Date(order.order_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">{order.user_email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(order.shipping_status)}>{order.shipping_status}</Badge>
                      <span className="font-semibold">${order.total_amount.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium mb-2">Payment Status</h4>
                      <Badge variant={order.payment_status === "completed" ? "default" : "secondary"}>
                        {order.payment_status}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Order Date</h4>
                      <p className="text-sm text-gray-600">{new Date(order.order_date).toLocaleDateString()}</p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Update Status</h4>
                      <Select
                        value={order.shipping_status}
                        onValueChange={(value) => handleStatusChange(order.order_id, value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="returned">Returned</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Order #{order.order_id} Details</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                          <div>
                            <h4 className="font-semibold mb-2">Customer Information</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Name:</span> {order.user_name || "N/A"}
                              </div>
                              <div>
                                <span className="text-gray-600">Email:</span> {order.user_email || "N/A"}
                              </div>
                              <div>
                                <span className="text-gray-600">Order Date:</span>{" "}
                                {new Date(order.order_date).toLocaleDateString()}
                              </div>
                              <div>
                                <span className="text-gray-600">Total:</span> ${order.total_amount.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button variant="outline" size="sm">
                      <Package className="mr-2 h-4 w-4" />
                      Print Label
                    </Button>

                    <Button variant="outline" size="sm">
                      <Truck className="mr-2 h-4 w-4" />
                      Track Package
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
