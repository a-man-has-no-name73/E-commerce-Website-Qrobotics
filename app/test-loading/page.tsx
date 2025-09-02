"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loading,
  ProductCardLoading,
  ProductGridLoading,
  ProductDetailLoading,
  TableLoading,
  FormLoading,
  PageLoading,
} from "@/components/ui/loading";

export default function LoadingTestPage() {
  const [showPageLoading, setShowPageLoading] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  const testButtonLoading = () => {
    setIsButtonLoading(true);
    setTimeout(() => setIsButtonLoading(false), 3000);
  };

  const testPageLoading = () => {
    setShowPageLoading(true);
    setTimeout(() => setShowPageLoading(false), 3000);
  };

  if (showPageLoading) {
    return <PageLoading text="Testing page loading..." />;
  }

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Loading Components Test</h1>
        <p className="text-gray-600">Test all loading component variants</p>
      </div>

      {/* Basic Loading Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Loading Variants</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <p className="mb-4 font-medium">Spinner</p>
            <Loading variant="spinner" size="lg" />
          </div>
          <div className="text-center">
            <p className="mb-4 font-medium">Dots</p>
            <Loading variant="dots" size="lg" />
          </div>
          <div className="text-center">
            <p className="mb-4 font-medium">Bars</p>
            <Loading variant="bars" size="lg" />
          </div>
          <div className="text-center">
            <p className="mb-4 font-medium">Skeleton</p>
            <Loading variant="skeleton" size="lg" />
          </div>
        </CardContent>
      </Card>

      {/* Size Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Size Variants (Spinner)</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-around">
          <div className="text-center">
            <p className="mb-2">Small</p>
            <Loading variant="spinner" size="sm" />
          </div>
          <div className="text-center">
            <p className="mb-2">Medium</p>
            <Loading variant="spinner" size="md" />
          </div>
          <div className="text-center">
            <p className="mb-2">Large</p>
            <Loading variant="spinner" size="lg" />
          </div>
          <div className="text-center">
            <p className="mb-2">Extra Large</p>
            <Loading variant="spinner" size="xl" />
          </div>
        </CardContent>
      </Card>

      {/* Loading with Text */}
      <Card>
        <CardHeader>
          <CardTitle>Loading with Text</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Loading variant="spinner" size="md" text="Loading products..." />
          <Loading variant="dots" size="md" text="Processing order..." />
          <Loading variant="bars" size="md" text="Uploading images..." />
        </CardContent>
      </Card>

      {/* Button Loading */}
      <Card>
        <CardHeader>
          <CardTitle>Button Loading State</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={testButtonLoading} disabled={isButtonLoading}>
            {isButtonLoading ? (
              <>
                <Loading variant="spinner" size="sm" className="mr-2" />
                Processing...
              </>
            ) : (
              "Test Button Loading"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Specialized Loading Components */}
      <Card>
        <CardHeader>
          <CardTitle>Product Card Loading</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ProductCardLoading />
            <ProductCardLoading />
            <ProductCardLoading />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Product Grid Loading</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductGridLoading count={4} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Table Loading</CardTitle>
        </CardHeader>
        <CardContent>
          <TableLoading rows={5} columns={4} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Form Loading</CardTitle>
        </CardHeader>
        <CardContent>
          <FormLoading />
        </CardContent>
      </Card>

      {/* Test Page Loading */}
      <Card>
        <CardHeader>
          <CardTitle>Page Loading Test</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={testPageLoading}>
            Test Page Loading (3 seconds)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
