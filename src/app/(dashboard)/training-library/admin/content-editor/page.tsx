import { ContentEditorClient } from "./ContentEditorClient";

export const dynamic = "force-dynamic";

interface ContentEditorProps {
  contentType?: 'micro-lesson' | 'branching-scenario' | 'simulation' | 'assessment' | 'pathway';
  contentId?: string;
}

export default function ContentEditorPage() {
  return <ContentEditorClient />;
}