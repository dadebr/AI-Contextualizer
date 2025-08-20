import { ContextualizerUi } from '@/components/contextualizer-ui';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gemini Contextualizer',
  description: 'An AI assistant to help you with your text-based tasks.',
};

export default function Home() {
  return <ContextualizerUi />;
}
