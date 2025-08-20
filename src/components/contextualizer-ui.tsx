"use client";

import { useState, useTransition, useEffect } from 'react';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

import { Bot, Combine, Languages, SpellCheck, BookText, Copy, AlertTriangle, KeyRound, Loader2, Sparkles, ChevronDown, Search, GraduationCap, Code, FileCode, X } from 'lucide-react';

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

// Helper to get action title
const getActionTitle = (action: AiAction) => {
  const titles: Record<AiAction, string> = {
      'rewrite': 'Reescrever Texto',
      'review': 'Revisar Texto',
      'deepen': 'Aprofundar Texto',
      'summarize': 'Resumir Texto',
      'translate': 'Traduzir Texto',
      'explain': 'Explicar Texto',
      'teach': 'Ensinar a Usar',
      'generatePrompt': 'Gerador de Prompt'
  };
  return titles[action];
}


export function ContextualizerUi() {
  const [text, setText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', original: '', result: '', error: '' });
  const [isPending, startTransition] = useTransition();
  const [isExtension, setIsExtension] = useState(false);

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
  useEffect(() => {
    form.reset(settings);
  }, [settings, form]);

  useEffect(() => {
    // Check if running in an iframe, which is how it will be used as an extension
    if (window.self !== window.top) {
      setIsExtension(true);
    }
    
    const handleMessage = (event: MessageEvent) => {
      const { type, action, text } = event.data;
      if (type === 'GEMINI_ACTION_START') {
        const title = getActionTitle(action as AiAction);
        handleAction(action as AiAction, title, text);
      }
    };
    window.addEventListener('message', handleMessage);

    // This is for the chrome extension's context menu click
    if (chrome && chrome.runtime && chrome.runtime.onMessage) {
        chrome.runtime.onMessage.addListener((request) => {
            if (request.action && request.text) {
                const title = getActionTitle(request.action as AiAction);
                handleAction(request.action as AiAction, title, request.text);
            }
        });
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);


  function onSubmit(data: SettingsValues) {
    setSettings(data);
    toast({
      title: "Settings Saved",
      description: "Your API Key and model selection have been saved.",
    });
  }

  const handleAction = (action: AiAction, actionTitle: string, initialText?: string) => {
    const textToProcess = initialText ?? text;

    if (!textToProcess.trim()) {
      toast({
        variant: "destructive",
        title: "No Text Provided",
        description: "Please enter some text in the textarea to perform an action.",
      });
      return;
    }

    setModalContent({ title: actionTitle, original: textToProcess, result: '', error: '' });
    setModalOpen(true);

    startTransition(async () => {
      const lang = typeof navigator !== 'undefined' ? navigator.language : 'en';
      const response = await performAiAction(action, textToProcess, lang);
      if (response.error) {
        setModalContent(prev => ({ ...prev, error: response.error! }));
      } else {
        setModalContent(prev => ({ ...prev, result: response.result! }));
      }
    });
  };

  const handleCopy = () => {
    if(modalContent.result) {
      navigator.clipboard.writeText(modalContent.result).then(() => {
        toast({
          title: "Copied to Clipboard",
        });
      }).catch(err => {
        toast({
            variant: "destructive",
            title: "Failed to Copy",
            description: "Could not copy text to clipboard.",
        });
      });
    }
  }

  const handleInject = () => {
    if (modalContent.result) {
      setText(modalContent.result);
      setModalOpen(false);
      toast({
        title: "Text Injected",
        description: "The AI result has been placed in the text area.",
      });
    }
  };
  
  const closeModal = () => {
    setModalOpen(false);
    if(isExtension) {
        window.parent.postMessage({ type: 'CLOSE_MODAL' }, '*');
    }
  }

  // If in extension mode, and modal is not open, show nothing.
  // This allows the page to act as the UI provider for the extension modal
  if (isExtension && !modalOpen) {
    return null;
  }
  
  // If in extension mode, and modal is open, show only the modal.
  if (isExtension && modalOpen) {
     return (
        <Dialog open={modalOpen} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-[625px] h-auto max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-primary flex items-center gap-2">{modalContent.title}</DialogTitle>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-6">
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
              <div className="max-h-[300px] overflow-y-auto p-4 bg-muted rounded-lg">
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
          </div>
          <DialogFooter className="mt-auto pt-4 border-t">
            {!isPending && !modalContent.error && (
                 <div className="flex gap-2 justify-end w-full">
                    <Button size="sm" variant="outline" onClick={handleCopy}>
                      <Copy className="mr-2" />
                      Copiar
                    </Button>
                  </div>
            )}
            <Button variant="outline" onClick={closeModal}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
     )
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
                        <span>The API key is securely stored in your browser's local storage. Your key is required for the extension to make calls to the Google AI API.</span>
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
                      <DropdownMenuItem onClick={() => handleAction('rewrite', 'Reescrever Texto')}>
                        <Combine className="w-4 h-4 mr-2" />
                        Reescrever
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction('review', 'Revisar Texto')}>
                        <SpellCheck className="w-4 h-4 mr-2" />
                        Revisar
                      </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => handleAction('deepen', 'Aprofundar Texto')}>
                        <Search className="w-4 h-4 mr-2" />
                        Aprofundar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction('summarize', 'Resumir Texto')}>
                        <BookText className="w-4 h-4 mr-2" />
                        Resumir
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction('translate', 'Traduzir Texto')}>
                        <Languages className="w-4 h-4 mr-2" />
                        Traduzir
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleAction('explain', 'Explicar Texto')}>
                        <GraduationCap className="w-4 h-4 mr-2" />
                        Explicar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction('teach', 'Ensinar a Usar')}>
                        <Code className="w-4 h-4 mr-2" />
                        Ensinar a Usar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction('generatePrompt', 'Gerador de Prompt')}>
                        <FileCode className="w-4 h-4 mr-2" />
                        Gerador de Prompt
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardFooter>
              </Card>
            </div>
          </div>
        </main>
      </div>

      <Dialog open={modalOpen && !isExtension} onOpenChange={setModalOpen}>
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
              <div className="max-h-[300px] overflow-y-auto p-4 bg-muted rounded-lg">
                <p className="whitespace-pre-wrap text-foreground/90">{modalContent.result}</p>
              </div>
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="outline" onClick={handleCopy}>
                  <Copy className="mr-2" />
                  Copiar
                </Button>
                <Button size="sm" onClick={handleInject}>
                  <Sparkles className="mr-2" />
                  Injetar no Editor
                </Button>
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
