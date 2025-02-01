import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function About() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 pt-8">
      <h1 className="text-3xl font-bold mb-6">About Us</h1>
      <div className="w-full max-w-2xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Developer 1</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              A passionate developer with expertise in React and Next.js. Loves creating interactive and engaging web
              applications.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Developer 2</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              An experienced full-stack developer with a focus on real-time applications and game development. Enjoys
              solving complex problems and optimizing performance.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

