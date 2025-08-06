
"use client";

import React, { useState, type FC, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Copy, Home, Loader2, PenTool, Settings, Sparkles, Twitter, Users, Webhook, Newspaper, Info, Link as LinkIcon, BotMessageSquare } from 'lucide-react';

import { generateAdCopyVariations, type GenerateAdCopyVariationsOutput } from '@/ai/flows/generate-content-variations';
import { generateSocialMediaContent, type GenerateSocialMediaContentOutput } from '@/ai/flows/suggest-social-media-content';
import { optimizeContentForSeo, type OptimizeContentForSeoOutput } from '@/ai/flows/optimize-for-seo';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger, SidebarGroup, SidebarGroupLabel } from '@/components/ui/sidebar';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';

const TONES = ['Professional', 'Witty', 'Bold', 'Casual', 'Informative', 'Sarcastic', 'Friendly', 'Luxury'];
const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Mandarin', 'Japanese', 'Portuguese'];
const GENDERS = ['All', 'Female', 'Male', 'Non-binary'];

const adCopySchema = z.object({
  productName: z.string().min(2, { message: 'Product name is required.' }),
  productDescription: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  targetAudience: z.object({
    ageRange: z.string().min(2, { message: 'Age range is required (e.g., 25-35).' }),
    gender: z.string(),
    location: z.string().min(2, { message: 'Location is required.' }),
    interests: z.string().min(2, { message: 'Interests are required.' }),
  }),
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

const ContentSection = () => {
    const searchParams = useSearchParams();
    const activeView = searchParams.get('view') || 'ad-copy';
    
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={activeView}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-4xl mx-auto"
            >
                {activeView === 'ad-copy' && <AdCopyGenerator />}
                {activeView === 'social-media' && <SocialMediaGenerator />}
                {activeView === 'seo' && <SeoOptimizer />}
            </motion.div>
        </AnimatePresence>
    );
};


function AdCopyGenerator() {
  const { toast } = useToast();
  const [adCopyState, setAdCopyState] = useState<AdCopyState>({ loading: false, result: null });
  const adCopyForm = useForm<z.infer<typeof adCopySchema>>({
    resolver: zodResolver(adCopySchema),
    defaultValues: {
      productName: '',
      productDescription: '',
      targetAudience: { ageRange: '25-40', gender: GENDERS[0], location: 'United States', interests: 'Technology, Productivity' },
      numberOfVariations: 3,
      tone: TONES[0],
      language: LANGUAGES[0],
    },
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

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Generate Ad Copy</CardTitle>
          <CardDescription>Create compelling ad copy variations for your products.</CardDescription>
        </CardHeader>
        <Form {...adCopyForm}>
          <form onSubmit={adCopyForm.handleSubmit(onAdCopySubmit)}>
            <CardContent className="space-y-4">
              <FormField control={adCopyForm.control} name="productName" render={({ field }) => (<FormItem><FormLabel>Product Name</FormLabel><FormControl><Input placeholder="e.g., Smartwatch Pro" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={adCopyForm.control} name="productDescription" render={({ field }) => (<FormItem><FormLabel>Product Description</FormLabel><FormControl><Textarea placeholder="Describe your product's key features and benefits" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <Accordion type="single" collapsible defaultValue="item-1">
                <AccordionItem value="item-1">
                  <AccordionTrigger><div className="flex items-center gap-2"><Users className="h-4 w-4" /><span className="font-medium">Detailed Audience Targeting</span></div></AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField control={adCopyForm.control} name="targetAudience.ageRange" render={({ field }) => (<FormItem><FormLabel>Age Range</FormLabel><FormControl><Input placeholder="e.g., 25-35" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={adCopyForm.control} name="targetAudience.gender" render={({ field }) => (<FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a gender" /></SelectTrigger></FormControl><SelectContent>{GENDERS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                    </div>
                    <FormField control={adCopyForm.control} name="targetAudience.location" render={({ field }) => (<FormItem><FormLabel>Location(s)</FormLabel><FormControl><Input placeholder="e.g., Urban areas, California" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={adCopyForm.control} name="targetAudience.interests" render={({ field }) => (<FormItem><FormLabel>Interests & Behaviors</FormLabel><FormControl><Textarea placeholder="e.g., Tech enthusiasts, fitness lovers, bargain hunters" {...field} /></FormControl><FormDescription>Separate interests with commas.</FormDescription><FormMessage /></FormItem>)} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={adCopyForm.control} name="tone" render={({ field }) => (<FormItem><FormLabel>Tone of Voice</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a tone" /></SelectTrigger></FormControl><SelectContent>{TONES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={adCopyForm.control} name="language" render={({ field }) => (<FormItem><FormLabel>Language</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a language" /></SelectTrigger></FormControl><SelectContent>{LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
              </div>
              <FormField control={adCopyForm.control} name="numberOfVariations" render={({ field }) => (<FormItem><FormLabel>Number of Variations ({field.value})</FormLabel><FormControl><Input type="range" min="1" max="5" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={adCopyState.loading} className="w-full sm:w-auto">{adCopyState.loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="mr-2 h-4 w-4" /> Generate Copy</>}</Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      <AnimatePresence>
        {adCopyState.loading && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-8 space-y-4"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></motion.div>)}
        {!adCopyState.loading && adCopyState.result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
            <h3 className="text-lg font-semibold font-headline mb-4">Generated Variations</h3>
            <div className="space-y-4">
              {adCopyState.result.adCopyVariations.map((variation, index) => (
                <Card key={index} className="bg-secondary/50">
                  <CardHeader className="flex flex-row items-start justify-between py-4"><CardTitle className="text-base font-medium">Variation {index + 1}</CardTitle><Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard(variation.copy, 'Variation')}><Copy className="h-4 w-4" /></Button></CardHeader>
                  <CardContent className="pt-0 space-y-4">
                    <p className="text-sm">{variation.copy}</p>
                    <div className="flex items-start gap-3 p-3 rounded-md bg-background/50">
                      <Info className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      <div><h4 className="font-semibold text-xs mb-1">Why it's engaging</h4><p className="text-xs text-muted-foreground">{variation.explanation}</p></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
        {!adCopyState.loading && !adCopyState.result && (<ResultPlaceholder title="Ad Copy Results" description="Your generated ad copy variations will appear here." icon={PenTool} />)}
      </AnimatePresence>
    </>
  );
}

function SocialMediaGenerator() {
    const { toast } = useToast();
    const [socialMediaState, setSocialMediaState] = useState<SocialMediaState>({ loading: false, result: null });
    const socialMediaForm = useForm<z.infer<typeof socialMediaSchema>>({
        resolver: zodResolver(socialMediaSchema),
        defaultValues: { copy: '', tone: TONES[0], language: LANGUAGES[0] },
    });

    const handleCopyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: `${type} copied!`, description: 'The content has been copied to your clipboard.' });
    };

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

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Generate Social Media Post</CardTitle>
                    <CardDescription>Create engaging posts and get hashtag suggestions.</CardDescription>
                </CardHeader>
                <Form {...socialMediaForm}>
                    <form onSubmit={socialMediaForm.handleSubmit(onSocialMediaSubmit)}>
                        <CardContent className="space-y-4">
                            <FormField control={socialMediaForm.control} name="copy" render={({ field }) => (<FormItem><FormLabel>Core Message or Topic</FormLabel><FormControl><Textarea placeholder="Enter your main idea, link, or keywords..." className="min-h-[150px]" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField control={socialMediaForm.control} name="tone" render={({ field }) => (<FormItem><FormLabel>Tone of Voice</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a tone" /></SelectTrigger></FormControl><SelectContent>{TONES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                <FormField control={socialMediaForm.control} name="language" render={({ field }) => (<FormItem><FormLabel>Language</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a language" /></SelectTrigger></FormControl><SelectContent>{LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={socialMediaState.loading} className="w-full sm:w-auto">{socialMediaState.loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="mr-2 h-4 w-4" /> Generate Post</>}</Button>
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
                                <div><CardTitle>Generated Post</CardTitle><CardDescription>Your ready-to-use social media content.</CardDescription></div>
                                <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard(socialMediaState.result!.content, 'Post')}><Copy className="h-4 w-4" /></Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm whitespace-pre-wrap">{socialMediaState.result.content}</p>
                                <Separator />
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-sm">Suggested Hashtags:</h4>
                                    <div className="flex flex-wrap gap-2">{socialMediaState.result.hashtags.map((tag, index) => <Badge key={index} variant="secondary">{tag}</Badge>)}</div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
                {!socialMediaState.loading && !socialMediaState.result && (<ResultPlaceholder title="Social Media Post" description="Your generated post and hashtags will appear here." icon={Twitter} />)}
            </AnimatePresence>
        </>
    );
}

function SeoOptimizer() {
    const { toast } = useToast();
    const [seoState, setSeoState] = useState<SeoState>({ loading: false, result: null });
    const seoForm = useForm<z.infer<typeof seoSchema>>({
        resolver: zodResolver(seoSchema),
        defaultValues: { content: '', targetKeyword: '' },
    });
    
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

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>SEO Content Optimizer</CardTitle>
                    <CardDescription>Improve your content's ranking with SEO suggestions.</CardDescription>
                </CardHeader>
                <Form {...seoForm}>
                    <form onSubmit={seoForm.handleSubmit(onSeoSubmit)}>
                        <CardContent className="space-y-4">
                            <FormField control={seoForm.control} name="content" render={({ field }) => (<FormItem><FormLabel>Your Content</FormLabel><FormControl><Textarea placeholder="Paste your blog post, article, or landing page copy here..." className="min-h-[200px]" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={seoForm.control} name="targetKeyword" render={({ field }) => (<FormItem><FormLabel>Target Keyword (Optional)</FormLabel><FormControl><Input placeholder="e.g., 'best AI copywriter'" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={seoState.loading} className="w-full sm:w-auto">{seoState.loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Optimizing...</> : <><Sparkles className="mr-2 h-4 w-4" /> Optimize Content</>}</Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
            <AnimatePresence>
                {seoState.loading && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-8"><Skeleton className="h-48 w-full" /></motion.div>}
                {!seoState.loading && seoState.result && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
                        <Card>
                            <CardHeader><CardTitle>SEO Recommendations</CardTitle><CardDescription>Implement these suggestions to boost your SEO.</CardDescription></CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2"><h4 className="font-semibold text-sm">Suggested Title</h4><p className="text-sm p-3 bg-secondary/50 rounded-md font-mono">{seoState.result.metadata.title}</p></div>
                                <div className="space-y-2"><h4 className="font-semibold text-sm">Suggested Meta Description</h4><p className="text-sm p-3 bg-secondary/50 rounded-md">{seoState.result.metadata.description}</p></div>
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-sm">Suggested Keywords</h4>
                                    <div className="flex flex-wrap gap-2">{seoState.result.keywords.map((kw, index) => <Badge key={index} variant="secondary">{kw}</Badge>)}</div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
                {!seoState.loading && !seoState.result && (<ResultPlaceholder title="SEO Analysis" description="Your SEO suggestions will appear here." icon={LinkIcon} />)}
            </AnimatePresence>
        </>
    );
}

const ResultPlaceholder: FC<{title: string; description: string; icon: React.ElementType}> = ({ title, description, icon: Icon}) => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed rounded-lg bg-card mt-8 min-h-[400px]">
        <div className="bg-secondary p-4 rounded-full mb-4">
            <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold font-headline mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
    </div>
);


function DashboardPage() {
  const searchParams = useSearchParams();
  const activeView = searchParams.get('view') || 'ad-copy';

  const pageTitle = useMemo(() => {
    switch (activeView) {
      case 'ad-copy': return 'AI Ad Copy Generator';
      case 'social-media': return 'AI Social Media Assistant';
      case 'seo': return 'SEO Content Optimizer';
      default: return 'AI Copywriter';
    }
  }, [activeView]);

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full">
        <Sidebar className="border-r hidden md:flex">
          <SidebarHeader className="border-b">
            <Link href="/" className="flex items-center gap-2 font-semibold font-headline">
              <PenTool className="h-6 w-6 text-primary" />
              <span>Writomate</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/dashboard">
                  <SidebarMenuButton>
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
            <SidebarGroup>
                <SidebarGroupLabel className="flex items-center">
                    <BotMessageSquare className="mr-2" />
                    <span>Content Tools</span>
                </SidebarGroupLabel>
                <SidebarMenu>
                     <SidebarMenuItem>
                        <Link href="/dashboard?view=ad-copy">
                          <SidebarMenuButton isActive={activeView === 'ad-copy'}>
                            <PenTool className="h-4 w-4" />
                            <span>Ad Copy</span>
                          </SidebarMenuButton>
                        </Link>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <Link href="/dashboard?view=social-media">
                          <SidebarMenuButton isActive={activeView === 'social-media'}>
                            <Twitter className="h-4 w-4" />
                            <span>Social Media</span>
                          </SidebarMenuButton>
                        </Link>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <Link href="/dashboard?view=seo">
                          <SidebarMenuButton isActive={activeView === 'seo'}>
                            <LinkIcon className="h-4 w-4" />
                            <span>SEO Optimizer</span>
                          </SidebarMenuButton>
                        </Link>
                      </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroup>
             <SidebarMenu>
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
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-xl font-semibold font-headline hidden sm:block">{pageTitle}</h1>
            <div className="ml-auto flex items-center gap-2 sm:gap-4">
              <Button variant="outline" size="sm">View Plans</Button>
              <Button className="bg-accent hover:bg-accent/90" size="sm">
                <Sparkles className="h-4 w-4 mr-2" />
                Upgrade
              </Button>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6">
             <React.Suspense fallback={<div>Loading...</div>}>
                <ContentSection />
             </React.Suspense>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}


export default function DashboardPageWrapper() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <DashboardPage />
    </React.Suspense>
  )
}
