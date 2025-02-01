import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-6">Object Finding Game</h1>
      <p className="text-center mb-8 max-w-md">
        Compete against other players to find objects in the real world! Be the first to show the given object to your
        camera and claim points.
      </p>
      <div className="space-y-4">
        <Link href="/connect">
          <Button className="w-full">Connect</Button>
        </Link>
        <Link href="/about">
          <Button variant="outline" className="w-full">
            About Us
          </Button>
        </Link>
      </div>
    </div>
  )
}

