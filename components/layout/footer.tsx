import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Qrobotics</h3>
            <p className="text-gray-400">Leading provider of premium robotics solutions and automation technology.</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Products</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/products?category=manufacturing">Manufacturing Automation</Link>
              </li>
              <li>
                <Link href="/products?category=warehouse">Warehouse & Logistics</Link>
              </li>
              <li>
                <Link href="/products?category=office">Office Automation</Link>
              </li>
              <li>
                <Link href="/products?category=healthcare">Healthcare & Lab</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/support">Help Center</Link>
              </li>
              <li>
                <Link href="/contact">Contact Us</Link>
              </li>
              <li>
                <Link href="/warranty">Warranty</Link>
              </li>
              <li>
                <Link href="/documentation">Documentation</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/about">About Us</Link>
              </li>
              <li>
                <Link href="/careers">Careers</Link>
              </li>
              <li>
                <Link href="/news">News</Link>
              </li>
              <li>
                <Link href="/privacy">Privacy Policy</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Qrobotics. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
