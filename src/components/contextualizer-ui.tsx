"use client";

import { useState, useTransition } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import useLocalStorage from '@/hooks/use-local-storage';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

import { Bot, Combine, Languages, SpellCheck, BookText, Copy, AlertTriangle, KeyRound, Loader2, Sparkles, ChevronDown } from 'lucide-react';

import { performAiAction, type AiAction } from '@/app/actions';

const settingsSchema = z.object({
  apiKey: z.string().min(1, "API Key is required."),
  model: z.string(),
});

type SettingsValues = z.infer<typeof settingsSchema>;

const modelOptions = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.5-pro'
];

export function ContextualizerUi() {
  const [text, setText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', original: '', result: '', error: '' });
  const [isPending, startTransition] = useTransition();

  const { toast } = useToast();

  const [settings, setSettings] = useLocalStorage<SettingsValues>('gemini-contextualizer-settings', {
    apiKey: '',
    model: 'gemini-2.5-flash',
  });

  const form = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    values: settings,
  });
  
  // Resync form if settings change in another tab
  useState(() => {
    form.reset(settings);
  });


  function onSubmit(data: SettingsValues) {
    setSettings(data);
    toast({
      title: "Settings Saved",
      description: "Your API Key and model selection have been saved.",
    });
  }

  const handleAction = (action: AiAction, actionTitle: string) => {
    if (!text.trim()) {
      toast({
        variant: "destructive",
        title: "No Text Provided",
        description: "Please enter some text in the textarea to perform an action.",
      });
      return;
    }

    setModalContent({ title: actionTitle, original: text, result: '', error: '' });
    setModalOpen(true);

    startTransition(async () => {
      const lang = typeof navigator !== 'undefined' ? navigator.language : 'en';
      const response = await performAiAction(action, text, lang);
      if (response.error) {
        setModalContent(prev => ({ ...prev, error: response.error! }));
      } else {
        setModalContent(prev => ({ ...prev, result: response.result! }));
      }
    });
  };

  const handleCopy = () => {
    if(modalContent.result) {
      navigator.clipboard.writeText(modalContent.result);
      toast({
        title: "Copied to Clipboard",
      });
    }
  }

  return (
    <>
      <div className="flex flex-col min-h-screen bg-background font-body">
        <header className="p-4 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
          <div className="container mx-auto flex items-center gap-3">
            <Bot className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold font-headline text-foreground">Gemini Contextualizer</h1>
              <p className="text-sm text-muted-foreground">AI Assistant Settings & Playground</p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 container mx-auto">
          <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
            
            <div className="xl:col-span-1">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><KeyRound/> Settings</CardTitle>
                  <CardDescription>Configure your Google AI Studio API Key and select your preferred model.</CardDescription>
                </CardHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="apiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Google AI Studio API Key</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Enter your API Key" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="model"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gemini Model</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a model" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {modelOptions.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg flex items-start gap-2.5">
                        <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5 text-foreground/60" />
                        <span>For this demo, the API key is saved to local storage but not used for API calls. The backend uses a pre-configured key from environment variables.</span>
                       </div>
                    </CardContent>
                    <CardFooter>
                      <Button type="submit">Save Settings</Button>
                    </CardFooter>
                  </form>
                </Form>
              </Card>
            </div>

            <div className="lg:col-span-1 xl:col-span-2">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Sparkles /> AI Actions</CardTitle>
                  <CardDescription>Enter text below to simulate selecting it on a webpage, then choose an action.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Paste or type text here to get started..."
                    className="min-h-[200px] text-base"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button>
                        Ações de IA
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleAction('rewrite', 'Rewrite Text')}>
                        <Combine className="w-4 h-4 mr-2" />
                        Reescrever
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction('translate', 'Translate Text')}>
                        <Languages className="w-4 h-4 mr-2" />
                        Traduzir
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction('review', 'Review Text')}>
                        <SpellCheck className="w-4 h-4 mr-2" />
                        Revisar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction('summarize', 'Summarize Text')}>
                        <BookText className="w-4 h-4 mr-2" />
                        Resumir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardFooter>
              </Card>
            </div>
          </div>
        </main>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle className="text-primary flex items-center gap-2">{modalContent.title}</DialogTitle>
          </DialogHeader>
          {isPending ? (
            <div className="flex flex-col items-center justify-center p-8 gap-4 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span>Processing with Gemini...</span>
            </div>
          ) : modalContent.error ? (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg space-y-2">
                <h3 className="font-bold flex items-center gap-2"><AlertTriangle /> Error Occurred</h3>
                <p className="text-sm">{modalContent.error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="max-h-[300px] overflow-y-auto p-4 bg-muted rounded-lg relative group">
                <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity" onClick={handleCopy} aria-label="Copy result to clipboard"><Copy className="h-4 w-4"/></Button>
                <p className="whitespace-pre-wrap text-foreground/90">{modalContent.result}</p>
              </div>
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger>Show Original Text</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{modalContent.original}</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
