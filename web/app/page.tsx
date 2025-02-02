'use client'

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-4xl font-bold">Object Finding Game</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6">
            Compete against other players to find objects in the real world! Be the first to show the given object to
            your camera and claim points.
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
        </CardContent>
      </Card>
    </div>
  );
}
