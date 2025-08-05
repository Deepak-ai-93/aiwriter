import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, PenTool, Sparkles, Twitter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="flex items-center gap-2 font-semibold font-headline">
            <PenTool className="h-6 w-6 text-primary" />
            <span className="text-lg">CopySpark</span>
          </Link>
          <nav className="ml-auto flex items-center gap-4 sm:gap-6">
            <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4">Features</Link>
            <Link href="#pricing" className="text-sm font-medium hover:underline underline-offset-4">Pricing</Link>
            <Link href="/dashboard">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 md:py-32">
          <div className="container text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tighter mb-6">
              Generate Brilliant Copy in Seconds with AI
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-8">
              CopySpark is your AI-powered assistant for creating high-converting ad copy, engaging social media posts, and SEO-optimized content.
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="bg-accent hover:bg-accent/90">
                Start Creating for Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        <section id="features" className="py-20 md:py-32 bg-secondary">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">Features for Every Marketer</h2>
              <p className="max-w-xl mx-auto text-muted-foreground mt-4">
                Unlock a suite of powerful tools to supercharge your content creation process.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                    <PenTool className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Ad Copy Generation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Instantly create multiple variations of compelling ad copy for your products and services. Test different angles and find what converts best.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                    <Twitter className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Social Media Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Generate engaging social media content tailored to your brand's voice. Get relevant hashtag suggestions to maximize your reach.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"/></svg>
                  </div>
                  <CardTitle>SEO Optimization</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Improve your content's search engine ranking. Get suggestions for keywords, meta titles, and descriptions.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        <section className="py-20 md:py-32">
            <div className="container grid md:grid-cols-2 gap-16 items-center">
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold font-headline mb-6">Works Where You Do</h2>
                    <p className="text-muted-foreground mb-8">CopySpark is designed to be a seamless part of your workflow. The intuitive interface and powerful features make it easy to get from idea to published content in minutes.</p>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-4">
                            <div className="bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center shrink-0 mt-1">✓</div>
                            <p><strong className="font-semibold">User-Friendly Dashboard:</strong> All your tools in one place, with a clean and intuitive layout.</p>
                        </li>
                        <li className="flex items-start gap-4">
                             <div className="bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center shrink-0 mt-1">✓</div>
                            <p><strong className="font-semibold">Responsive Design:</strong> Generate content on the go from your desktop, tablet, or mobile device.</p>
                        </li>
                        <li className="flex items-start gap-4">
                             <div className="bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center shrink-0 mt-1">✓</div>
                            <p><strong className="font-semibold">Easy Export:</strong> Copy your generated content to your clipboard with a single click.</p>
                        </li>
                    </ul>
                </div>
                <div>
                    <Image src="https://placehold.co/600x400.png" alt="Dashboard Screenshot" width={600} height={400} className="rounded-xl shadow-2xl" data-ai-hint="dashboard screenshot" />
                </div>
            </div>
        </section>

      </main>

      <footer className="border-t py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} CopySpark. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-sm hover:underline">Privacy Policy</Link>
            <Link href="#" className="text-sm hover:underline">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
