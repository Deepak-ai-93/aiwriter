
"use client";

import { useState, type FC } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Copy, Home, Loader2, PenTool, Settings, Sparkles, Twitter, Users, Webhook, Newspaper, Languages, CreativeCommons, CircleUser } from 'lucide-react';

import { generateAdCopyVariations, type GenerateAdCopyVariationsOutput } from '@/ai/flows/generate-content-variations';
import { generateSocialMediaContent, type GenerateSocialMediaContentOutput } from '@/ai/flows/suggest-social-media-content';
import { optimizeContentForSeo, type OptimizeContentForSeoOutput } from '@/ai/flows/optimize-for-seo';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';

const TONES = ['Professional', 'Witty', 'Bold', 'Casual', 'Informative', 'Sarcastic', 'Friendly', 'Luxury'];
const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Mandarin', 'Japanese', 'Portuguese'];

const adCopySchema = z.object({
  productName: z.string().min(2, { message: 'Product name is required.' }),
  productDescription: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  targetAudience: z.string().min(2, { message: 'Target audience is required.' }),
  numberOfVariations: z.coerce.number().min(1).max(5),
  tone: z.string(),
  language: z.string(),
});

const socialMediaSchema = z.object({
  copy: z.string().min(10, { message: 'Content must be at least 10 characters.' }),
  tone: z.string(),
  language: z.string(),
});

const seoSchema = z.object({
  content: z.string().min(10, { message: 'Content must be at least 10 characters.' }),
  targetKeyword: z.string().optional(),
});

type AdCopyState = { loading: boolean; result: GenerateAdCopyVariationsOutput | null; };
type SocialMediaState = { loading: boolean; result: GenerateSocialMediaContentOutput | null; };
type SeoState = { loading: boolean; result: OptimizeContentForSeoOutput | null; };

export default function DashboardPage() {
  const { toast } = useToast();
  const [adCopyState, setAdCopyState] = useState<AdCopyState>({ loading: false, result: null });
  const [socialMediaState, setSocialMediaState] = useState<SocialMediaState>({ loading: false, result: null });
  const [seoState, setSeoState] = useState<SeoState>({ loading: false, result: null });

  const adCopyForm = useForm<z.infer<typeof adCopySchema>>({
    resolver: zodResolver(adCopySchema),
    defaultValues: {
      productName: '',
      productDescription: '',
      targetAudience: '',
      numberOfVariations: 3,
      tone: TONES[0],
      language: LANGUAGES[0],
    },
  });

  const socialMediaForm = useForm<z.infer<typeof socialMediaSchema>>({
    resolver: zodResolver(socialMediaSchema),
    defaultValues: { copy: '', tone: TONES[0], language: LANGUAGES[0] },
  });

  const seoForm = useForm<z.infer<typeof seoSchema>>({
    resolver: zodResolver(seoSchema),
    defaultValues: { content: '', targetKeyword: '' },
  });

  const handleCopyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${type} copied!`, description: 'The content has been copied to your clipboard.' });
  };

  async function onAdCopySubmit(values: z.infer<typeof adCopySchema>) {
    setAdCopyState({ loading: true, result: null });
    try {
      const result = await generateAdCopyVariations({
        ...values,
        productDescription: `Style: ${values.tone}. Language: ${values.language}. Description: ${values.productDescription}`,
      });
      setAdCopyState({ loading: false, result });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate ad copy. Please try again.' });
      setAdCopyState({ loading: false, result: null });
    }
  }

  async function onSocialMediaSubmit(values: z.infer<typeof socialMediaSchema>) {
    setSocialMediaState({ loading: true, result: null });
    try {
      const result = await generateSocialMediaContent({
        copy: `Tone: ${values.tone}. Language: ${values.language}. Content: ${values.copy}`,
      });
      setSocialMediaState({ loading: false, result });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate social media post. Please try again.' });
      setSocialMediaState({ loading: false, result: null });
    }
  }

  async function onSeoSubmit(values: z.infer<typeof seoSchema>) {
    setSeoState({ loading: true, result: null });
    try {
      const result = await optimizeContentForSeo(values);
      setSeoState({ loading: false, result });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to optimize content. Please try again.' });
      setSeoState({ loading: false, result: null });
    }
  }
  
  const ResultPlaceholder: FC<{title: string; description: string; icon: React.ElementType}> = ({ title, description, icon: Icon}) => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed rounded-lg bg-card mt-8">
        <div className="bg-secondary p-4 rounded-full mb-4">
            <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold font-headline mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full">
        <Sidebar className="border-r hidden md:flex">
          <SidebarHeader className="border-b">
            <Link href="/" className="flex items-center gap-2 font-semibold font-headline">
              <PenTool className="h-6 w-6 text-primary" />
              <span>CopySpark</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive>
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Newspaper className="h-4 w-4" />
                  <span>History</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Webhook className="h-4 w-4" />
                  <span>Integrations</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Users className="h-4 w-4" />
                  <span>Team</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t">
             <SidebarMenu>
               <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-xl font-semibold font-headline hidden sm:block">AI Copywriter</h1>
            <div className="ml-auto flex items-center gap-4">
              <Button variant="outline">View Plans</Button>
              <Button className="bg-accent hover:bg-accent/90">
                <Sparkles className="h-4 w-4 mr-2" />
                New Project
              </Button>
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="icon" className="rounded-full">
                    <CircleUser className="h-5 w-5" />
                    <span className="sr-only">Toggle user menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem>Support</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6">
            <Tabs defaultValue="ad-copy" className="w-full max-w-4xl mx-auto">
              <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 max-w-lg mx-auto mb-6">
                <TabsTrigger value="ad-copy">
                  <PenTool className="h-4 w-4 mr-2" /> Ad Copy
                </TabsTrigger>
                <TabsTrigger value="social-media">
                  <Twitter className="h-4 w-4 mr-2" /> Social Media
                </TabsTrigger>
                <TabsTrigger value="seo">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"/></svg>
                   SEO Optimizer
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="ad-copy">
                <Card>
                  <CardHeader>
                    <CardTitle>Generate Ad Copy</CardTitle>
                    <CardDescription>Create compelling ad copy variations for your products.</CardDescription>
                  </CardHeader>
                  <Form {...adCopyForm}>
                    <form onSubmit={adCopyForm.handleSubmit(onAdCopySubmit)}>
                      <CardContent className="space-y-4">
                        <FormField control={adCopyForm.control} name="productName" render={({ field }) => (
                          <FormItem><FormLabel>Product Name</FormLabel><FormControl><Input placeholder="e.g., Smartwatch Pro" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={adCopyForm.control} name="productDescription" render={({ field }) => (
                          <FormItem><FormLabel>Product Description</FormLabel><FormControl><Textarea placeholder="Describe your product's key features and benefits" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={adCopyForm.control} name="targetAudience" render={({ field }) => (
                          <FormItem><FormLabel>Target Audience</FormLabel><FormControl><Input placeholder="e.g., Tech enthusiasts, fitness lovers" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField control={adCopyForm.control} name="tone" render={({ field }) => (
                            <FormItem><FormLabel>Tone of Voice</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a tone" /></SelectTrigger></FormControl><SelectContent>{TONES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                          )} />
                          <FormField control={adCopyForm.control} name="language" render={({ field }) => (
                            <FormItem><FormLabel>Language</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a language" /></SelectTrigger></FormControl><SelectContent>{LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                          )} />
                        </div>
                         <FormField control={adCopyForm.control} name="numberOfVariations" render={({ field }) => (
                          <FormItem><FormLabel>Number of Variations ({field.value})</FormLabel><FormControl><Input type="range" min="1" max="5" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </CardContent>
                      <CardFooter>
                        <Button type="submit" disabled={adCopyState.loading} className="w-full sm:w-auto">
                          {adCopyState.loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="mr-2 h-4 w-4" /> Generate Copy</>}
                        </Button>
                      </CardFooter>
                    </form>
                  </Form>
                </Card>
                <AnimatePresence>
                  {adCopyState.loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-8 space-y-4">
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                    </motion.div>
                  )}
                  {!adCopyState.loading && adCopyState.result && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
                       <h3 className="text-lg font-semibold font-headline mb-4">Generated Variations</h3>
                        <div className="space-y-4">
                        {adCopyState.result.adCopyVariations.map((variation, index) => (
                          <Card key={index} className="bg-secondary/50">
                            <CardHeader className="flex flex-row items-start justify-between py-4">
                              <CardTitle className="text-base font-medium">Variation {index + 1}</CardTitle>
                              <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard(variation, 'Variation')}>
                                <Copy className="h-4 w-4" />
                              </Button>
                            </CardHeader>
                            <CardContent className="pt-0"><p className="text-sm">{variation}</p></CardContent>
                          </Card>
                        ))}
                      </div>
                    </motion.div>
                  )}
                  {!adCopyState.loading && !adCopyState.result && (
                      <ResultPlaceholder title="Ad Copy Results" description="Your generated ad copy variations will appear here." icon={PenTool} />
                  )}
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="social-media">
                <Card>
                  <CardHeader>
                    <CardTitle>Generate Social Media Post</CardTitle>
                    <CardDescription>Create engaging posts and get hashtag suggestions.</CardDescription>
                  </CardHeader>
                  <Form {...socialMediaForm}>
                  <form onSubmit={socialMediaForm.handleSubmit(onSocialMediaSubmit)}>
                    <CardContent className="space-y-4">
                      <FormField control={socialMediaForm.control} name="copy" render={({ field }) => (
                          <FormItem><FormLabel>Core Message or Topic</FormLabel><FormControl><Textarea placeholder="Enter your main idea, link, or keywords..." className="min-h-[150px]" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField control={socialMediaForm.control} name="tone" render={({ field }) => (
                          <FormItem><FormLabel>Tone of Voice</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a tone" /></SelectTrigger></FormControl><SelectContent>{TONES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                        )} />
                        <FormField control={socialMediaForm.control} name="language" render={({ field }) => (
                          <FormItem><FormLabel>Language</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a language" /></SelectTrigger></FormControl><SelectContent>{LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                        )} />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" disabled={socialMediaState.loading} className="w-full sm:w-auto">
                        {socialMediaState.loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="mr-2 h-4 w-4" /> Generate Post</>}
                      </Button>
                    </CardFooter>
                  </form>
                  </Form>
                </Card>
                <AnimatePresence>
                  {socialMediaState.loading && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-8"><Skeleton className="h-48 w-full" /></motion.div>}
                  {!socialMediaState.loading && socialMediaState.result && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
                         <Card>
                            <CardHeader className="flex flex-row items-start justify-between">
                                <div>
                                <CardTitle>Generated Post</CardTitle>
                                <CardDescription>Your ready-to-use social media content.</CardDescription>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard(socialMediaState.result!.content, 'Post')}>
                                  <Copy className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm whitespace-pre-wrap">{socialMediaState.result.content}</p>
                                <Separator />
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-sm">Suggested Hashtags:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {socialMediaState.result.hashtags.map((tag, index) => <Badge key={index} variant="secondary">{tag}</Badge>)}
                                    </div>
                                </div>
                            </CardContent>
                         </Card>
                      </motion.div>
                  )}
                  {!socialMediaState.loading && !socialMediaState.result && (
                      <ResultPlaceholder title="Social Media Post" description="Your generated post and hashtags will appear here." icon={Twitter} />
                  )}
                </AnimatePresence>
              </TabsContent>
              
              <TabsContent value="seo">
                 <Card>
                  <CardHeader>
                    <CardTitle>SEO Content Optimizer</CardTitle>
                    <CardDescription>Improve your content's ranking with SEO suggestions.</CardDescription>
                  </CardHeader>
                  <Form {...seoForm}>
                  <form onSubmit={seoForm.handleSubmit(onSeoSubmit)}>
                    <CardContent className="space-y-4">
                      <FormField control={seoForm.control} name="content" render={({ field }) => (
                          <FormItem><FormLabel>Your Content</FormLabel><FormControl><Textarea placeholder="Paste your blog post, article, or landing page copy here..." className="min-h-[200px]" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={seoForm.control} name="targetKeyword" render={({ field }) => (
                        <FormItem><FormLabel>Target Keyword (Optional)</FormLabel><FormControl><Input placeholder="e.g., 'best AI copywriter'" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </CardContent>
                    <CardFooter>
                       <Button type="submit" disabled={seoState.loading} className="w-full sm:w-auto">
                        {seoState.loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Optimizing...</> : <><Sparkles className="mr-2 h-4 w-4" /> Optimize Content</>}
                      </Button>
                    </CardFooter>
                  </form>
                  </Form>
                </Card>
                <AnimatePresence>
                    {seoState.loading && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-8"><Skeleton className="h-48 w-full" /></motion.div>}
                    {!seoState.loading && seoState.result && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
                        <Card>
                           <CardHeader>
                             <CardTitle>SEO Recommendations</CardTitle>
                             <CardDescription>Implement these suggestions to boost your SEO.</CardDescription>
                           </CardHeader>
                           <CardContent className="space-y-6">
                              <div className="space-y-2">
                                  <h4 className="font-semibold text-sm">Suggested Title</h4>
                                  <p className="text-sm p-3 bg-secondary/50 rounded-md font-mono">{seoState.result.metadata.title}</p>
                              </div>
                              <div className="space-y-2">
                                  <h4 className="font-semibold text-sm">Suggested Meta Description</h4>
                                  <p className="text-sm p-3 bg-secondary/50 rounded-md">{seoState.result.metadata.description}</p>
                              </div>
                              <div className="space-y-2">
                                  <h4 className="font-semibold text-sm">Suggested Keywords</h4>
                                  <div className="flex flex-wrap gap-2">
                                      {seoState.result.keywords.map((kw, index) => <Badge key={index} variant="secondary">{kw}</Badge>)}
                                  </div>
                              </div>
                           </CardContent>
                        </Card>
                      </motion.div>
                    )}
                    {!seoState.loading && !seoState.result && (
                      <ResultPlaceholder title="SEO Analysis" description="Your SEO suggestions will appear here." icon={svg_seo_icon} />
                    )}
                </AnimatePresence>
              </TabsContent>
            </Tabs>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

const svg_seo_icon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"/></svg>;

    