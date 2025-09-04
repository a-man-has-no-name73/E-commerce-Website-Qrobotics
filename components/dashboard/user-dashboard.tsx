"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/components/auth/auth-context";
import { useToast } from "@/hooks/use-toast";

export function UserDashboard() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
  });
  const [loading, setLoading] = useState(false);

  // Address management state
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [addressData, setAddressData] = useState({
    address_type: "shipping" as "billing" | "shipping",
    street_address: "",
    city: "",
    postal_code: "",
    is_default: false,
  });
  const [addressLoading, setAddressLoading] = useState(false);

  // Initialize profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.firstName || "",
        last_name: user.lastName || "",
        phone_number: user.phoneNumber || "",
      });
      fetchUserProfile();
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/auth/addresses?user_id=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setAddresses(data.addresses || []);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setAddressLoading(true);
    try {
      const url = editingAddress
        ? `/api/auth/addresses/${editingAddress.address_id}`
        : "/api/auth/addresses";

      const method = editingAddress ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          ...addressData,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Address ${
            editingAddress ? "updated" : "created"
          } successfully`,
        });
        setIsAddressDialogOpen(false);
        setEditingAddress(null);
        resetAddressForm();
        fetchAddresses();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to save address",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while saving address",
        variant: "destructive",
      });
    } finally {
      setAddressLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: number) => {
    if (!user) return;

    try {
      const response = await fetch(
        `/api/auth/addresses/${addressId}?user_id=${user.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "Address deleted successfully",
        });
        fetchAddresses();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete address",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while deleting address",
        variant: "destructive",
      });
    }
  };

  const openAddressDialog = (address?: any) => {
    if (address) {
      setEditingAddress(address);
      setAddressData({
        address_type: address.address_type,
        street_address: address.street_address,
        city: address.city,
        postal_code: address.postal_code,
        is_default: address.is_default,
      });
    } else {
      setEditingAddress(null);
      resetAddressForm();
    }
    setIsAddressDialogOpen(true);
  };

  const resetAddressForm = () => {
    setAddressData({
      address_type: "shipping",
      street_address: "",
      city: "",
      postal_code: "",
      is_default: false,
    });
  };

  const handleAddressInputChange = (field: string, value: string | boolean) => {
    setAddressData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/auth/profile?user_id=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setProfileData({
          first_name: data.user.first_name || "",
          last_name: data.user.last_name || "",
          phone_number: data.user.phone_number || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate phone number if provided
    if (profileData.phone_number && profileData.phone_number.length !== 11) {
      toast({
        title: "Validation Error",
        description: "Phone number must be exactly 11 digits",
        variant: "destructive",
      });
      return;
    }

    // Validate phone number contains only digits
    if (profileData.phone_number && !/^\d+$/.test(profileData.phone_number)) {
      toast({
        title: "Validation Error",
        description: "Phone number must contain only digits",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          ...profileData,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
        setIsEditingProfile(false);
        // Update the auth context with new user data
        updateUser({
          firstName: profileData.first_name,
          lastName: profileData.last_name,
          phoneNumber: profileData.phone_number,
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to update profile",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while updating profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Mock data
  const orders = [
    {
      id: 1001,
      date: "2024-01-15",
      status: "delivered",
      total: 24999,
      items: 2,
    },
    {
      id: 1002,
      date: "2024-01-20",
      status: "shipped",
      total: 8999,
      items: 1,
    },
  ];

  const tabs = [
    { id: "profile", name: "Profile" },
    { id: "orders", name: "Order History" },
    { id: "addresses", name: "Addresses" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600">
          Manage your account and view your orders.
        </p>
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
          {activeTab === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isEditingProfile ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          First Name
                        </label>
                        <p className="text-gray-900">
                          {profileData.first_name || user?.firstName}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Last Name
                        </label>
                        <p className="text-gray-900">
                          {profileData.last_name || user?.lastName}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Email
                      </label>
                      <p className="text-gray-900">{user?.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Phone Number
                      </label>
                      <p className="text-gray-900">
                        {profileData.phone_number ||
                          user?.phoneNumber ||
                          "Not provided"}
                      </p>
                    </div>
                    <Button onClick={() => setIsEditingProfile(true)}>
                      Edit Profile
                    </Button>
                  </>
                ) : (
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="first_name">First Name</Label>
                        <Input
                          id="first_name"
                          value={profileData.first_name}
                          onChange={(e) =>
                            handleInputChange("first_name", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="last_name">Last Name</Label>
                        <Input
                          id="last_name"
                          value={profileData.last_name}
                          onChange={(e) =>
                            handleInputChange("last_name", e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={user?.email || ""}
                        disabled
                        className="bg-gray-100"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Email cannot be changed
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="phone_number">Phone Number</Label>
                      <Input
                        id="phone_number"
                        value={profileData.phone_number}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, ""); // Remove non-digits
                          if (value.length <= 11) {
                            handleInputChange("phone_number", value);
                          }
                        }}
                        placeholder="Enter 11-digit phone number"
                        maxLength={11}
                        pattern="[0-9]{11}"
                      />
                      {profileData.phone_number &&
                        profileData.phone_number.length > 0 &&
                        profileData.phone_number.length !== 11 && (
                          <p className="text-sm text-red-500 mt-1">
                            Phone number must be exactly 11 digits
                          </p>
                        )}
                    </div>
                    <div className="flex space-x-2">
                      <Button type="submit" disabled={loading}>
                        {loading ? "Updating..." : "Save Changes"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditingProfile(false);
                          // Reset form data to current user data
                          setProfileData({
                            first_name: user?.firstName || "",
                            last_name: user?.lastName || "",
                            phone_number: user?.phoneNumber || "",
                          });
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "orders" && (
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">Order #{order.id}</h3>
                          <p className="text-sm text-gray-600">{order.date}</p>
                        </div>
                        <Badge
                          variant={
                            order.status === "delivered"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          {order.items} items
                        </span>
                        <span className="font-semibold">
                          ${order.total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "addresses" && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Addresses</CardTitle>
                  <Dialog
                    open={isAddressDialogOpen}
                    onOpenChange={setIsAddressDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button onClick={() => openAddressDialog()}>
                        Add New Address
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>
                          {editingAddress ? "Edit Address" : "Add New Address"}
                        </DialogTitle>
                      </DialogHeader>
                      <form
                        onSubmit={handleAddressSubmit}
                        className="space-y-4"
                      >
                        <div>
                          <Label htmlFor="address_type">Address Type</Label>
                          <Select
                            value={addressData.address_type}
                            onValueChange={(value) =>
                              handleAddressInputChange("address_type", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select address type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="shipping">Shipping</SelectItem>
                              <SelectItem value="billing">Billing</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="street_address">Street Address</Label>
                          <Input
                            id="street_address"
                            value={addressData.street_address}
                            onChange={(e) =>
                              handleAddressInputChange(
                                "street_address",
                                e.target.value
                              )
                            }
                            placeholder="Enter street address"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={addressData.city}
                            onChange={(e) =>
                              handleAddressInputChange("city", e.target.value)
                            }
                            placeholder="Enter city"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="postal_code">Postal Code</Label>
                          <Input
                            id="postal_code"
                            value={addressData.postal_code}
                            onChange={(e) =>
                              handleAddressInputChange(
                                "postal_code",
                                e.target.value
                              )
                            }
                            placeholder="Enter postal code"
                            required
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="is_default"
                            checked={addressData.is_default}
                            onChange={(e) =>
                              handleAddressInputChange(
                                "is_default",
                                e.target.checked
                              )
                            }
                          />
                          <Label htmlFor="is_default">
                            Set as default address
                          </Label>
                        </div>
                        <div className="flex space-x-2">
                          <Button type="submit" disabled={addressLoading}>
                            {addressLoading
                              ? "Saving..."
                              : editingAddress
                              ? "Update Address"
                              : "Add Address"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsAddressDialogOpen(false);
                              setEditingAddress(null);
                              resetAddressForm();
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {addresses.length > 0 ? (
                    addresses.map((address) => (
                      <div
                        key={address.address_id}
                        className="border rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold capitalize">
                                {address.address_type} Address
                              </h3>
                              {address.is_default && (
                                <Badge variant="outline">Default</Badge>
                              )}
                            </div>
                            <p className="text-gray-600 mb-1">
                              {address.street_address}
                            </p>
                            <p className="text-gray-600">
                              {address.city}, {address.postal_code}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openAddressDialog(address)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDeleteAddress(address.address_id)
                              }
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No addresses found. Add your first address above.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
